// ── rpc.ts ──
// Reusable RPC server factory for Bun with TypeScript

import { serve, Server } from "bun";

export interface RpcServerOptions {
  /** Port to listen on (default: 3000) */
  port?: number;
  /** CORS allowed origins */
  allowedOrigins?: string[];
  /** Optional HTML file to serve at root */
  staticFile?: string | null;
  /** Optional path to source file for type extraction */
  sourceFile?: string;
}

export interface ApiMethodInfo {
  name: string;
  type: string;
  params: Array<{ name: string; type?: string }>;
  returnType?: string;
  description?: string;
}

export type ApiDefinition = Record<string, (...args: any[]) => any | Promise<any>>;

/**
 * Creates an RPC server that exposes an API object over HTTP
 * @param api - Object containing methods to expose
 * @param options - Server configuration
 * @returns Bun server instance
 */
export function makeRpcServer<T extends ApiDefinition>(
  api: T,
  options: RpcServerOptions = {}
): Server {
  const {
    port = 3000,
    allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"],
    staticFile = null,
    sourceFile = null,
  } = options;

  // Cache for parsed type information
  let typeCache: Map<string, { params: Array<{ name: string; type?: string }>; returnType?: string; description?: string }> | null = null;

  async function extractTypesFromSource(): Promise<Map<string, any>> {
    if (!sourceFile) return new Map();
    
    try {
      const source = await Bun.file(sourceFile).text();
      const typeMap = new Map();
      
      // Match function definitions in the api object
      // Pattern: functionName: (param: type, ...) => returnType or : async () => Promise<type>
      const functionRegex = /(\w+):\s*(?:async\s*)?\(([^)]*)\)\s*(?::\s*([^=>{]+))?(?:=>|{)/g;
      
      let match;
      while ((match = functionRegex.exec(source)) !== null) {
        const [, name, paramsStr, returnTypeStr] = match;
        
        const params = paramsStr.trim() ? paramsStr.split(',').map(p => {
          const param = p.trim();
          const colonIndex = param.indexOf(':');
          if (colonIndex !== -1) {
            return {
              name: param.substring(0, colonIndex).trim(),
              type: param.substring(colonIndex + 1).trim()
            };
          }
          return { name: param };
        }) : [];
        
        const returnType = returnTypeStr?.trim();
        
        // Try to find JSDoc comment for this function
        const functionIndex = match.index;
        const beforeFunction = source.substring(Math.max(0, functionIndex - 200), functionIndex);
        const docMatch = beforeFunction.match(/\/\*\*([^*]|\*(?!\/))*\*\/\s*$/);
        let description: string | undefined;
        
        if (docMatch) {
          const doc = docMatch[0];
          const descMatch = doc.match(/\/\*\*\s*([^@\n*]+)/);
          if (descMatch) {
            description = descMatch[1].trim();
          }
        }
        
        typeMap.set(name, { params, returnType, description });
      }
      
      return typeMap;
    } catch (error) {
      console.error("Failed to extract types from source:", error);
      return new Map();
    }
  }

  async function handler(req: Request): Promise<Response> {
    console.log(`${req.method} ${req.url} from ${req.headers.get("origin") || "unknown origin"}`);

    const url = new URL(req.url);
    const pathname = url.pathname;

    // Serve static HTML file at root if provided
    if (staticFile && req.method === "GET" && (pathname === "/" || pathname === `/${staticFile}`)) {
      return new Response(Bun.file(staticFile), {
        headers: { "Content-Type": "text/html" },
      });
    }

    // API discovery endpoint
    if (req.method === "GET" && pathname === "/rpc/methods") {
      // Load type information from source file if available
      if (!typeCache && sourceFile) {
        typeCache = await extractTypesFromSource();
      }
      
      const methods: ApiMethodInfo[] = Object.keys(api).map(name => {
        const fn = api[name];
        const typeInfo = typeCache?.get(name);
        
        let params: Array<{ name: string; type?: string }> = [];
        let returnType: string | undefined;
        let description: string | undefined;
        
        if (typeInfo) {
          params = typeInfo.params;
          returnType = typeInfo.returnType;
          description = typeInfo.description;
        } else if (typeof fn === "function") {
          // Fallback: extract parameter names without types
          const fnStr = fn.toString();
          const match = fnStr.match(/\(([^)]*)\)/);
          if (match && match[1].trim()) {
            params = match[1].split(',').map(p => ({ name: p.trim() }));
          }
        }
        
        return {
          name,
          type: typeof fn === "function" ? "function" : "unknown",
          params,
          returnType,
          description,
        };
      });
      return new Response(JSON.stringify({ methods }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      const origin = req.headers.get("origin");
      const isAllowed = origin && allowedOrigins.includes(origin);

      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": isAllowed ? origin : "",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // RPC endpoint
    if (pathname === "/rpc" && req.method === "POST") {
      const contentType = req.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return new Response("Bad request", { status: 400 });
      }

      let payload: { method: string; args: any[] };
      try {
        payload = await req.json();
      } catch {
        return new Response("Invalid JSON", { status: 400 });
      }

      const { method, args } = payload;
      const fn = api[method];
      if (!fn) {
        return new Response(JSON.stringify({ error: "unknown method" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      try {
        const result = await fn(...args);
        return new Response(JSON.stringify({ result }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        const error = e instanceof Error ? e.message : "Unknown error";
        return new Response(JSON.stringify({ error }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not found", { status: 404 });
  }

  const server = serve({
    fetch: handler,
    port,
  });

  console.log(`🚀 Bun RPC server listening at http://localhost:${server.port}`);
  console.log(`   API methods: ${Object.keys(api).join(", ")}`);
  console.log(`   Discovery: http://localhost:${server.port}/rpc/methods`);

  return server;
}
