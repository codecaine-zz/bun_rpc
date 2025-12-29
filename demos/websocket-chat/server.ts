// ── WebSocket Chat Demo ──
// Demonstrates Bun's WebSocket support in Bun.serve
// Run with: bun run demos/websocket-chat/server.ts

import { serve, type ServerWebSocket } from "bun";
import { join } from "path";

const CONFIG = {
  PORT: 3013,
  STATIC_FILE: join(import.meta.dir, "client.html"),
} as const;

interface ChatMessage {
  type: "message" | "join" | "leave" | "userlist";
  username?: string;
  text?: string;
  users?: string[];
  timestamp?: string;
}

interface WebSocketData {
  username: string;
}

// Store connected clients
const clients = new Map<ServerWebSocket, string>();
// Queue for pending usernames (FIFO)
const pendingUsernames: string[] = [];

serve({
  port: CONFIG.PORT,
  
  fetch(req, server) {
    const url = new URL(req.url);
    
    // Handle WebSocket upgrade
    if (url.pathname === "/ws") {
      const username = url.searchParams.get("username") || "Anonymous";
      
      // Add username to queue before upgrade
      pendingUsernames.push(username);
      
      const success = server.upgrade(req);
      if (success) {
        return;
      }
      // If upgrade failed, remove the username from queue
      pendingUsernames.pop();
      return new Response("WebSocket upgrade failed", { status: 500 });
    }
    
    // Serve static HTML file
    if (url.pathname === "/") {
      return new Response(Bun.file(CONFIG.STATIC_FILE));
    }
    
    return new Response("Not Found", { status: 404 });
  },
  
  websocket: {
    open(ws) {
      // Get username from queue (FIFO order)
      const username = pendingUsernames.shift() || "Anonymous";
      
      clients.set(ws, username);
      
      console.log(`✅ ${username} joined (${clients.size} users online)`);
      
      // Notify all users
      broadcast({
        type: "join",
        username,
        text: `${username} joined the chat`,
        timestamp: new Date().toISOString()
      });
      
      // Send user list to everyone
      broadcastUserList();
    },
    
    message(ws, message) {
      const username = clients.get(ws) || "Anonymous";
      const text = typeof message === "string" ? message : new TextDecoder().decode(message);
      
      console.log(`💬 ${username}: ${text}`);
      
      // Broadcast message to all clients
      broadcast({
        type: "message",
        username,
        text,
        timestamp: new Date().toISOString()
      });
    },
    
    close(ws) {
      const username = clients.get(ws);
      clients.delete(ws);
      
      console.log(`❌ ${username} left (${clients.size} users online)`);
      
      // Notify all users
      broadcast({
        type: "leave",
        username,
        text: `${username} left the chat`,
        timestamp: new Date().toISOString()
      });
      
      // Send updated user list
      broadcastUserList();
    },
  },
});

function broadcast(message: ChatMessage) {
  const data = JSON.stringify(message);
  for (const [client] of clients) {
    client.send(data);
  }
}

function broadcastUserList() {
  const users = Array.from(clients.values());
  broadcast({
    type: "userlist",
    users
  });
}

console.log(`💬 WebSocket Chat running at http://localhost:${CONFIG.PORT}`);
