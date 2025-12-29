// ── Redis Demo with Bun Redis Wrapper ──
// Demonstrates Redis operations with production-ready controllers
// Run with: bun run demos/redis/server.ts

import { makeRpcServer } from "../../rpc.ts";
import { createRedis, createNamespacedRedis } from "@codecaine/bun-redis-wrapper";
import { 
  SessionController, 
  CacheController, 
  RateLimiterController,
  CounterController,
  StorageController,
  LeaderboardController,
  AnalyticsController
} from "@codecaine/bun-redis-wrapper/controllers";
import { join } from "path";

const CONFIG = {
  PORT: 3013,
  STATIC_FILE: join(import.meta.dir, "client.html"),
  SOURCE_FILE: join(import.meta.dir, "server.ts"),
  REDIS_URL: "redis://localhost:6379",
} as const;

// Initialize Redis with namespace
const baseRedis = await createRedis(CONFIG.REDIS_URL);
const redis = createNamespacedRedis(baseRedis, "bun_rpc_demo");

// Initialize Controllers
const sessions = new SessionController(redis);
const cache = new CacheController(redis);
const rateLimiter = new RateLimiterController(redis);
const counter = new CounterController(redis);
const storage = new StorageController(redis);
const leaderboard = new LeaderboardController(redis);
const analytics = new AnalyticsController(redis);

// Simulated database for cache demo
const fakeDatabase = {
  users: new Map([
    ["1", { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "admin" }],
    ["2", { id: "2", name: "Bob Smith", email: "bob@example.com", role: "user" }],
    ["3", { id: "3", name: "Charlie Brown", email: "charlie@example.com", role: "user" }],
  ]),
  
  async getUser(id: string) {
    // Simulate slow database query
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.users.get(id);
  }
};

interface SessionData {
  userId: string;
  username: string;
  email: string;
  role: string;
  loginAt: number;
}

const api = {
  // ═══════════════════════════════════════════════════════════════════
  // Session Management
  // ═══════════════════════════════════════════════════════════════════
  
  /** Create a new user session */
  async createSession(userId: string, username: string, email: string, role: string) {
    const sessionData: SessionData = {
      userId,
      username,
      email,
      role,
      loginAt: Date.now()
    };
    
    const sessionId = await sessions.create(userId, sessionData);
    await counter.increment("sessions_created");
    
    return { 
      success: true, 
      sessionId,
      message: `Session created for ${username}`
    };
  },

  /** Validate and get session data */
  async getSession(sessionId: string) {
    const session = await sessions.validate(sessionId);
    if (!session) {
      return { success: false, message: "Session not found or expired" };
    }
    
    return { 
      success: true, 
      session: session.data,
      expiresIn: session.ttl
    };
  },

  /** List all active sessions for a user */
  async getUserSessions(userId: string) {
    const userSessions = await sessions.list(userId);
    return { 
      success: true, 
      sessions: userSessions,
      count: userSessions.length
    };
  },

  /** Destroy a session (logout) */
  async destroySession(sessionId: string) {
    const success = await sessions.destroy(sessionId);
    if (success) {
      await counter.increment("sessions_destroyed");
    }
    return { 
      success, 
      message: success ? "Session destroyed" : "Session not found" 
    };
  },

  /** Extend session TTL */
  async extendSession(sessionId: string) {
    const success = await sessions.extend(sessionId, 3600);
    return { 
      success, 
      message: success ? "Session extended by 1 hour" : "Session not found" 
    };
  },

  // ═══════════════════════════════════════════════════════════════════
  // Caching with Cache-Aside Pattern
  // ═══════════════════════════════════════════════════════════════════
  
  /** Get user with automatic caching */
  async getUserCached(userId: string) {
    const startTime = Date.now();
    
    const user = await cache.getOrSet(
      `user:${userId}`,
      () => fakeDatabase.getUser(userId),
      300 // Cache for 5 minutes
    );
    
    const duration = Date.now() - startTime;
    const stats = await cache.getStats();
    
    return {
      success: true,
      user,
      cached: duration < 50, // If < 50ms, it was cached
      duration,
      cacheStats: {
        hitRate: stats.hitRate,
        hits: stats.hits,
        misses: stats.misses
      }
    };
  },

  /** Invalidate user cache */
  async invalidateUserCache(userId: string) {
    await cache.invalidate(`user:${userId}`);
    return { success: true, message: `Cache invalidated for user ${userId}` };
  },

  /** Clear all cache */
  async clearCache() {
    await cache.clear();
    return { success: true, message: "All cache cleared" };
  },

  /** Get cache statistics */
  async getCacheStats() {
    const stats = await cache.getStats();
    return { success: true, stats };
  },

  // ═══════════════════════════════════════════════════════════════════
  // Rate Limiting
  // ═══════════════════════════════════════════════════════════════════
  
  /** Check rate limit for an API endpoint */
  async checkRateLimit(userId: string, endpoint: string) {
    const result = await rateLimiter.check(
      `${userId}:${endpoint}`, 
      10, // 10 requests
      60  // per minute
    );
    
    if (!result.allowed) {
      await counter.increment("rate_limit_violations");
    }
    
    return {
      allowed: result.allowed,
      remaining: result.remaining,
      retryAfter: result.retryAfter,
      message: result.allowed 
        ? `${result.remaining} requests remaining` 
        : `Rate limited. Retry after ${result.retryAfter}s`
    };
  },

  /** Reset rate limit for a user */
  async resetRateLimit(userId: string, endpoint: string) {
    await rateLimiter.reset(`${userId}:${endpoint}`);
    return { success: true, message: "Rate limit reset" };
  },

  // ═══════════════════════════════════════════════════════════════════
  // Counter Operations
  // ═══════════════════════════════════════════════════════════════════
  
  /** Get all application counters */
  async getCounters() {
    const counters = {
      sessions_created: await counter.get("sessions_created"),
      sessions_destroyed: await counter.get("sessions_destroyed"),
      rate_limit_violations: await counter.get("rate_limit_violations"),
      page_views: await counter.get("page_views"),
      api_calls: await counter.get("api_calls")
    };
    
    return { success: true, counters };
  },

  /** Increment a counter */
  async incrementCounter(name: string, amount: number = 1) {
    const value = await counter.increment(name, amount);
    return { success: true, name, value };
  },

  /** Decrement a counter */
  async decrementCounter(name: string, amount: number = 1) {
    const value = await counter.decrement(name, amount);
    return { success: true, name, value };
  },

  /** Reset a counter */
  async resetCounter(name: string) {
    await counter.reset(name);
    return { success: true, name, message: "Counter reset to 0" };
  },

  // ═══════════════════════════════════════════════════════════════════
  // Storage Operations (Key-Value)
  // ═══════════════════════════════════════════════════════════════════
  
  /** Store application settings */
  async saveSetting(key: string, value: any, ttl?: number) {
    await storage.set(`settings:${key}`, value, ttl);
    return { success: true, message: `Setting '${key}' saved` };
  },

  /** Get application setting */
  async getSetting(key: string) {
    const value = await storage.get(`settings:${key}`);
    return { 
      success: value !== null, 
      key, 
      value,
      exists: value !== null,
      message: value !== null ? `Setting '${key}' found` : `Setting '${key}' not found`
    };
  },

  /** List all settings */
  async listSettings() {
    const keys = await redis.scanAll("settings:*");
    const settings: Record<string, any> = {};
    
    for (const key of keys) {
      const cleanKey = key.replace("settings:", "");
      settings[cleanKey] = await storage.get(key);
    }
    
    return { success: true, settings, count: keys.length };
  },

  /** Delete a setting */
  async deleteSetting(key: string) {
    const success = await storage.delete(`settings:${key}`);
    return { 
      success, 
      message: success ? `Setting '${key}' deleted` : "Setting not found" 
    };
  },

  // ═══════════════════════════════════════════════════════════════════
  // Core Redis Operations
  // ═══════════════════════════════════════════════════════════════════
  
  /** Get Redis statistics */
  async getRedisStats() {
    const keys = await redis.scanAll("*");
    const counters = await api.getCounters();
    const cacheStats = await cache.getStats();
    
    return {
      success: true,
      stats: {
        totalKeys: keys.length,
        namespace: "bun_rpc_demo",
        counters: counters.counters,
        cache: cacheStats
      }
    };
  },

  /** Ping Redis connection */
  async ping() {
    try {
      // Simple test to verify connection
      await redis.set("ping_test", "pong", { EX: 1 });
      const result = await redis.get("ping_test");
      return { 
        success: true, 
        message: "Redis connection OK",
        response: result
      };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : "Connection failed"
      };
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // Demo Data
  // ═══════════════════════════════════════════════════════════════════
  
  /** Initialize demo data */
  async initDemoData() {
    // Create some demo sessions
    await api.createSession("1", "Alice Johnson", "alice@example.com", "admin");
    await api.createSession("2", "Bob Smith", "bob@example.com", "user");
    
    // Create some settings
    await api.saveSetting("theme", "dark");
    await api.saveSetting("notifications", true);
    await api.saveSetting("language", "en");
    
    // Initialize counters
    await counter.increment("page_views", 42);
    await counter.increment("api_calls", 128);
    
    return { success: true, message: "Demo data initialized" };
  },

  /** Clear all demo data */
  async clearAllData() {
    const keys = await redis.scanAll("*");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return { 
      success: true, 
      message: `Cleared ${keys.length} keys from Redis` 
    };
  },

  // ═══════════════════════════════════════════════════════════════════
  // Leaderboard Operations (Sorted Sets)
  // ═══════════════════════════════════════════════════════════════════
  
  /** Add or update player score */
  async addScore(boardName: string, playerName: string, score: number) {
    await leaderboard.addScore(boardName, playerName, score);
    return { 
      success: true, 
      message: `Added ${playerName} with score ${score} to ${boardName}` 
    };
  },

  /** Increment player score */
  async incrementScore(boardName: string, playerName: string, points: number) {
    const newScore = await leaderboard.incrementScore(boardName, playerName, points);
    return { 
      success: true, 
      playerName,
      newScore,
      message: `${playerName} gained ${points} points (total: ${newScore})` 
    };
  },

  /** Get top players */
  async getTopPlayers(boardName: string, count: number = 10) {
    const top = await leaderboard.getTop(boardName, count);
    return { 
      success: true, 
      board: boardName,
      players: top,
      count: top.length
    };
  },

  /** Get player rank and score */
  async getPlayerInfo(boardName: string, playerName: string) {
    const info = await leaderboard.getMemberInfo(boardName, playerName);
    if (!info) {
      return { 
        success: false, 
        message: `Player ${playerName} not found in ${boardName}` 
      };
    }
    return { 
      success: true, 
      player: playerName,
      rank: info.rank,
      score: info.score
    };
  },

  /** Get players around a specific player */
  async getPlayersAround(boardName: string, playerName: string, range: number = 3) {
    const players = await leaderboard.getAround(boardName, playerName, range);
    return { 
      success: true, 
      board: boardName,
      centerPlayer: playerName,
      players,
      count: players.length
    };
  },

  /** Get leaderboard statistics */
  async getLeaderboardStats(boardName: string) {
    const stats = await leaderboard.getStats(boardName);
    return { 
      success: true, 
      board: boardName,
      ...stats
    };
  },

  /** Clear leaderboard */
  async clearLeaderboard(boardName: string) {
    await leaderboard.clear(boardName);
    return { 
      success: true, 
      message: `Cleared leaderboard: ${boardName}` 
    };
  },

  // ═══════════════════════════════════════════════════════════════════
  // Analytics Operations (HyperLogLog)
  // ═══════════════════════════════════════════════════════════════════
  
  /** Track unique visitor */
  async trackVisitor(pageUrl: string, userId: string) {
    await analytics.trackUnique(pageUrl, userId);
    return { 
      success: true, 
      message: `Tracked visitor ${userId} to ${pageUrl}` 
    };
  },

  /** Track page view event */
  async trackPageView(pageUrl: string, userId: string) {
    await analytics.trackEvent("page-view", pageUrl, userId);
    return { 
      success: true, 
      message: `Tracked page view: ${pageUrl}` 
    };
  },

  /** Track daily active user */
  async trackDAU(userId: string) {
    await analytics.trackDAU(userId);
    return { 
      success: true, 
      message: `Tracked DAU for user ${userId}` 
    };
  },

  /** Get unique visitor count */
  async getUniqueVisitors(pageUrl: string) {
    const count = await analytics.getUniqueCount(pageUrl);
    return { 
      success: true, 
      page: pageUrl,
      uniqueVisitors: count
    };
  },

  /** Get daily active users count */
  async getDAU(date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const count = await analytics.getDAU(targetDate);
    return { 
      success: true, 
      date: targetDate.toISOString().split('T')[0],
      dau: count
    };
  },

  /** Get event statistics */
  async getEventStats(eventType: string, eventName: string) {
    const stats = await analytics.getEventStats(eventType, eventName);
    return { 
      success: true, 
      event: `${eventType}:${eventName}`,
      ...stats
    };
  },

  /** Get analytics summary */
  async getAnalyticsSummary() {
    const today = new Date();
    const dau = await analytics.getDAU(today);
    const metrics = await analytics.listMetrics();
    
    return { 
      success: true, 
      dau,
      totalMetrics: metrics.length,
      metrics: metrics.slice(0, 10) // Top 10 metrics
    };
  },

  // ═══════════════════════════════════════════════════════════════════
  // Geospatial Operations
  // ═══════════════════════════════════════════════════════════════════
  
  /** Add location */
  async addLocation(setName: string, name: string, longitude: number, latitude: number) {
    await redis.geoadd(setName, [longitude, latitude, name]);
    return { 
      success: true, 
      message: `Added location ${name} at [${latitude}, ${longitude}]` 
    };
  },

  /** Find nearby locations */
  async findNearbyLocations(setName: string, longitude: number, latitude: number, radius: number, unit: "km" | "mi" = "km") {
    const locations = await redis.georadius(setName, longitude, latitude, radius, unit);
    return { 
      success: true, 
      center: { longitude, latitude },
      radius: `${radius} ${unit}`,
      locations,
      count: locations.length
    };
  },

  /** Get distance between two locations */
  async getDistance(setName: string, location1: string, location2: string, unit: "km" | "mi" = "km") {
    const distance = await redis.geodist(setName, location1, location2, unit);
    return { 
      success: true, 
      from: location1,
      to: location2,
      distance: distance ? Number(distance) : null,
      unit
    };
  },

  /** Get location coordinates */
  async getLocationCoordinates(setName: string, locationName: string) {
    const positions = await redis.geopos(setName, locationName);
    if (!positions || !positions[0]) {
      return { 
        success: false, 
        message: `Location ${locationName} not found` 
      };
    }
    const [lng, lat] = positions[0] as [string, string];
    return { 
      success: true, 
      location: locationName,
      longitude: Number(lng),
      latitude: Number(lat)
    };
  },

  // ═══════════════════════════════════════════════════════════════════
  // Event Logging (Streams)
  // ═══════════════════════════════════════════════════════════════════
  
  /** Log an event */
  async logEvent(streamName: string, eventType: string, userId: string, data: Record<string, any>) {
    const eventData = {
      eventType,
      userId,
      timestamp: Date.now().toString(),
      ...data
    };
    
    const eventId = await redis.xadd(streamName, "*", eventData);
    return { 
      success: true, 
      eventId,
      message: `Logged ${eventType} event for ${userId}` 
    };
  },

  /** Get recent events */
  async getRecentEvents(streamName: string, count: number = 10) {
    const events = await redis.xrevrange(streamName, "+", "-", count);
    
    const formatted = events.map((event: any) => ({
      id: event[0],
      data: event[1]
    }));
    
    return { 
      success: true, 
      stream: streamName,
      events: formatted,
      count: formatted.length
    };
  },

  /** Get event count */
  async getEventCount(streamName: string) {
    const count = await redis.xlen(streamName);
    return { 
      success: true, 
      stream: streamName,
      eventCount: count
    };
  },

  /** Get events in time range */
  async getEventsByTimeRange(streamName: string, startTime: string, endTime: string) {
    const events = await redis.xrange(streamName, startTime, endTime);
    
    const formatted = events.map((event: any) => ({
      id: event[0],
      data: event[1]
    }));
    
    return { 
      success: true, 
      stream: streamName,
      events: formatted,
      count: formatted.length
    };
  }
};

makeRpcServer(api, {
  port: CONFIG.PORT,
  staticFile: CONFIG.STATIC_FILE,
  sourceFile: CONFIG.SOURCE_FILE,
  withSourceCode: true,
  onConnect: async () => {
    await counter.increment("page_views");
  }
});

console.log(`
╭────────────────────────────────────────────────────────╮
│  🚀 Redis Demo Server - Enhanced Edition              │
├────────────────────────────────────────────────────────┤
│  📡 Server:     http://localhost:${CONFIG.PORT}           │
│  🗄️  Database:   Redis (${CONFIG.REDIS_URL})              │
│  📦 Namespace:  bun_rpc_demo                           │
│                                                        │
│  🎯 Features:                                          │
│    • Sessions & Caching                                │
│    • Rate Limiting & Counters                          │
│    • Leaderboards (Sorted Sets)                        │
│    • Analytics (HyperLogLog)                           │
│    • Geospatial (Location Services)                    │
│    • Event Logging (Streams)                           │
╰────────────────────────────────────────────────────────╯
`);
