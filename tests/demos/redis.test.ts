// Tests for Redis Demo
// Run with: bun test tests/demos/redis.test.ts

import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { createRedis, createNamespacedRedis } from "@codecaine/bun-redis-wrapper";
import type { RedisWrapper } from "@codecaine/bun-redis-wrapper";

const TEST_NAMESPACE = "test:redis_demo";
let redis: ReturnType<typeof createNamespacedRedis>;
let baseRedis: RedisWrapper;

beforeAll(async () => {
  baseRedis = await createRedis("redis://localhost:6379");
  redis = createNamespacedRedis(baseRedis, TEST_NAMESPACE);
});

afterAll(async () => {
  // Clean up test data
  const keys = await redis.scanAll("*");
  if (keys.length > 0) {
    await redis.del(...keys);
  }
  await baseRedis[Symbol.asyncDispose]();
});

describe("Redis Demo - Core Operations", () => {
  test("should connect to Redis", async () => {
    const result = await redis.set("test_key", "test_value");
    expect(result).toBe("OK");
  });

  test("should store and retrieve values", async () => {
    await redis.set("key1", "value1");
    const value = await redis.get("key1");
    expect(value).toBe("value1");
  });

  test("should store and retrieve JSON", async () => {
    const data = { name: "Test", value: 123 };
    await redis.setJSON("json_key", data);
    const retrieved = await redis.getJSON<typeof data>("json_key");
    expect(retrieved).toEqual(data);
  });

  test("should handle TTL", async () => {
    await redis.set("ttl_key", "value", { EX: 1 });
    const ttl = await redis.ttl("ttl_key");
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(1);
  });

  test("should delete keys", async () => {
    await redis.set("delete_key", "value");
    const deleted = await redis.del("delete_key");
    expect(deleted).toBe(1);
    const value = await redis.get("delete_key");
    expect(value).toBeNull();
  });
});

describe("Redis Demo - Counter Operations", () => {
  test("should increment counters", async () => {
    const value1 = await redis.incr("counter1");
    expect(value1).toBe(1);
    const value2 = await redis.incr("counter1");
    expect(value2).toBe(2);
  });

  test("should decrement counters", async () => {
    await redis.set("counter2", "10");
    const value1 = await redis.decr("counter2");
    expect(value1).toBe(9);
    const value2 = await redis.decr("counter2");
    expect(value2).toBe(8);
  });
});

describe("Redis Demo - Hash Operations", () => {
  test("should set and get hash fields", async () => {
    await redis.hset("user:1", "name", "Alice");
    const name = await redis.hget("user:1", "name");
    expect(name).toBe("Alice");
  });

  test("should set and get multiple hash fields", async () => {
    await redis.hmset("user:2", { name: "Bob", email: "bob@example.com" });
    const fields = await redis.hmget("user:2", "name", "email");
    expect(fields).toEqual(["Bob", "bob@example.com"]);
  });

  test("should get all hash fields", async () => {
    await redis.hmset("user:3", { name: "Charlie", role: "admin" });
    const all = await redis.hgetAll("user:3");
    expect(all).toEqual({ name: "Charlie", role: "admin" });
  });
});

describe("Redis Demo - List Operations", () => {
  test("should push and pop from lists", async () => {
    await redis.lpush("list1", "item1", "item2");
    const item = await redis.rpop("list1");
    expect(item).toBe("item1");
  });

  test("should get list range", async () => {
    await redis.rpush("list2", "a", "b", "c", "d");
    const range = await redis.lrange("list2");
    expect(range).toEqual(["a", "b", "c", "d"]);
  });
});

describe("Redis Demo - Set Operations", () => {
  test("should add and retrieve set members", async () => {
    await redis.sadd("set1", "member1", "member2", "member3");
    const members = await redis.smembers("set1");
    expect(members).toHaveLength(3);
    expect(members).toContain("member1");
  });

  test("should remove set members", async () => {
    await redis.sadd("set2", "a", "b", "c");
    await redis.srem("set2", "b");
    const members = await redis.smembers("set2");
    expect(members).toHaveLength(2);
    expect(members).not.toContain("b");
  });
});

describe("Redis Demo - Pattern Matching", () => {
  test("should scan keys by pattern", async () => {
    await redis.set("session:1", "data1");
    await redis.set("session:2", "data2");
    await redis.set("config:1", "data3");
    
    const sessionKeys = await redis.scanAll("session:*");
    expect(sessionKeys.length).toBeGreaterThanOrEqual(2);
    expect(sessionKeys.every(key => key.startsWith("session:"))).toBe(true);
  });
});

describe("Redis Demo - Namespace Isolation", () => {
  test("should isolate keys in namespace", async () => {
    const ns1 = createNamespacedRedis(baseRedis, "ns1");
    const ns2 = createNamespacedRedis(baseRedis, "ns2");
    
    await ns1.set("key", "value1");
    await ns2.set("key", "value2");
    
    const value1 = await ns1.get("key");
    const value2 = await ns2.get("key");
    
    expect(value1).toBe("value1");
    expect(value2).toBe("value2");
    
    // Cleanup
    await ns1.del("key");
    await ns2.del("key");
  });
});

describe("Redis Demo - Session Simulation", () => {
  test("should create and validate session", async () => {
    const sessionData = {
      userId: "123",
      username: "testuser",
      loginAt: Date.now()
    };
    
    const sessionId = `session:${Date.now()}`;
    await redis.setJSON(sessionId, sessionData, { EX: 3600 });
    
    const retrieved = await redis.getJSON<typeof sessionData>(sessionId);
    expect(retrieved?.userId).toBe("123");
    expect(retrieved?.username).toBe("testuser");
    
    // Cleanup
    await redis.del(sessionId);
  });
});

describe("Redis Demo - Caching Simulation", () => {
  test("should implement cache-aside pattern", async () => {
    const cacheKey = "user:cache:123";
    
    // Check cache (miss)
    let cached = await redis.getJSON(cacheKey);
    expect(cached).toBeNull();
    
    // Fetch from "database" and cache
    const userData = { id: "123", name: "Test User" };
    await redis.setJSON(cacheKey, userData, { EX: 300 });
    
    // Check cache (hit)
    cached = await redis.getJSON(cacheKey);
    expect(cached).toEqual(userData);
    
    // Cleanup
    await redis.del(cacheKey);
  });
});

describe("Redis Demo - Rate Limiting Simulation", () => {
  test("should implement basic rate limiting", async () => {
    const key = "ratelimit:user:123";
    
    // First request
    const count1 = await redis.incr(key);
    await redis.setTTL(key, 60);
    expect(count1).toBe(1);
    
    // Second request
    const count2 = await redis.incr(key);
    expect(count2).toBe(2);
    
    // Check TTL is preserved
    const ttl = await redis.ttl(key);
    expect(ttl).toBeGreaterThan(0);
    
    // Cleanup
    await redis.del(key);
  });
});
