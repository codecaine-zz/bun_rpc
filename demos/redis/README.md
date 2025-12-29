# Redis Demo - Enhanced Edition

A comprehensive demo showcasing production-ready Redis operations using the [@codecaine/bun-redis-wrapper](https://github.com/codecaine-zz/bun_redis_wrapper) package with advanced features like leaderboards, analytics, geospatial, and event logging.

## Features

This demo demonstrates the following Redis controllers and data structures:

### 🔐 Session Management
- Create user sessions with automatic expiration
- Validate sessions and check TTL
- List all active sessions for a user
- Extend session lifetime
- Multi-device session support

### ⚡ Intelligent Caching
- Cache-aside pattern implementation
- Automatic cache statistics tracking
- Cache invalidation
- Hit/miss rate monitoring
- Performance comparison (cached vs uncached)

### 🚦 Rate Limiting
- Fixed window rate limiting
- Configurable limits per user/endpoint
- Automatic retry-after calculation
- Rate limit violation tracking
- Reset capabilities

### 🏆 Leaderboard (Sorted Sets)
- Add and update player scores
- Increment scores atomically
- Get top N players
- Get player rank and score
- View players around a specific rank
- Leaderboard statistics

### 📈 Analytics (HyperLogLog)
- Track unique visitors (memory-efficient)
- Track page views and events
- Daily Active Users (DAU) tracking
- Event statistics with unique counts
- Analytics summary dashboard

### 🗺️ Geospatial (Location Services)
- Add locations with coordinates
- Find nearby locations within radius
- Calculate distance between locations
- Get location coordinates
- Support for km/mi units

### 📝 Event Logging (Streams)
- Log events with timestamps
- View recent events
- Get event count
- Time-based event queries
- Audit trail capabilities

### 📊 Counters
- Atomic increment/decrement operations
- Application-wide statistics tracking
- Real-time counter updates
- Custom counter management

### 💾 Key-Value Storage
- Simple settings storage
- JSON serialization/deserialization
- TTL support for temporary data
- Pattern-based key listing

## Prerequisites

- Redis server running on `localhost:6379`

### Install Redis

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

**Docker:**
```bash
docker run -d -p 6379:6379 redis:latest
```

## Running the Demo

```bash
# From project root
bun run demos/redis/server.ts

# Or from demos/redis directory
cd demos/redis
bun run server.ts
```

Then open http://localhost:3013 in your browser.

## Demo Sections

### 1. Sessions Tab
- Create sessions for different users (Alice, Bob, Charlie)
- Validate and inspect session data
- Extend session TTL or destroy sessions
- List all active sessions for a user

### 2. Caching Tab
- Fetch user data with automatic caching
- Compare performance between cached and uncached requests
- Invalidate specific cache entries
- View cache statistics (hits, misses, hit rate)

### 3. Rate Limiting Tab
- Test rate limiting (10 requests per minute)
- Run spam test to see rate limiting in action
- Reset rate limits
- View remaining requests and retry-after time

### 4. Counters Tab
- View application-wide counters
- Increment/decrement custom counters
- Track sessions created/destroyed
- Monitor rate limit violations

### 5. Storage Tab
- Save application settings with optional TTL
- Retrieve and delete settings
- List all stored settings
- JSON value support

### 6. Leaderboard Tab 🆕
- Add player scores to game leaderboards
- Increment player scores atomically
- View top 10 players
- Get player rank and score info
- View players around a specific rank
- See leaderboard statistics

### 7. Analytics Tab 🆕
- Track page views across your application
- Monitor Daily Active Users (DAU)
- View unique visitors using HyperLogLog
- Get comprehensive analytics summary
- Memory-efficient unique counting

### 8. Locations Tab 🆕
- Add locations with lat/lon coordinates
- Find nearby locations within radius
- Calculate distance between two locations
- Support for kilometers and miles
- Real-time geospatial queries

### 9. Event Log Tab 🆕
- Log application events to Redis Streams
- View recent events with auto-refresh
- Get event count by type
- Query events by time range
- Perfect for audit trails

### 10. Admin Tab
- View Redis statistics (total keys, namespaces)
- Test Redis connection
- Initialize demo data
- Clear all data

## Architecture

### Namespace Isolation
All demo data is stored under the `bun_rpc_demo` namespace, preventing collisions with other Redis data.

### Controllers Used
- **SessionController**: Multi-device session management
- **CacheController**: Intelligent caching with cache-aside pattern
- **RateLimiterController**: Fixed window rate limiting
- **CounterController**: Atomic counters and statistics
- **StorageController**: Simple key-value storage
- **LeaderboardController**: Sorted sets for game leaderboards 🆕
- **AnalyticsController**: HyperLogLog for unique counting 🆕

### Redis Data Structures Used
- **Strings**: Session data, cache entries, settings
- **Hashes**: User data, session metadata
- **Sets**: Rate limit tracking
- **Sorted Sets**: Leaderboards with scores
- **HyperLogLog**: Unique visitor tracking
- **Geospatial Indexes**: Location data with radius queries
- **Streams**: Event logging with time-based queries

### Key Features
- Type-safe operations with TypeScript
- Automatic TTL management
- Real-time statistics tracking
- Production-ready patterns
- Clean separation of concerns
- Memory-efficient unique counting with HyperLogLog
- High-performance geospatial queries
- Durable event logging with Streams

## Testing

Run the test suite:

```bash
# Run Redis demo tests
bun test tests/demos/redis.test.ts

# Run all tests
bun test
```

The test suite includes 19 tests covering:
- Core Redis operations (get, set, delete, TTL)
- Counter operations (increment, decrement)
- Hash operations (hset, hget, hmget, hgetAll)
- List operations (push, pop, range)
- Set operations (add, remove, members)
- Pattern matching (scanAll)
- Namespace isolation
- Session simulation
- Cache-aside pattern
- Rate limiting

## API Methods

All API methods are accessible via WebSocket RPC:

**Session Management:**
- `createSession(userId, username, email, role)`
- `getSession(sessionId)`
- `getUserSessions(userId)`
- `destroySession(sessionId)`
- `extendSession(sessionId)`

**Caching:**
- `getUserCached(userId)`
- `invalidateUserCache(userId)`
- `clearCache()`
- `getCacheStats()`

**Rate Limiting:**
- `checkRateLimit(userId, endpoint)`
- `resetRateLimit(userId, endpoint)`

**Counters:**
- `getCounters()`
- `incrementCounter(name, amount)`
- `decrementCounter(name, amount)`

**Leaderboard:** 🆕
- `addScore(leaderboard, player, score)`
- `incrementScore(leaderboard, player, amount)`
- `getTopPlayers(leaderboard, count)`
- `getPlayerInfo(leaderboard, player)`
- `getPlayersAround(leaderboard, player, range)`
- `getLeaderboardStats(leaderboard)`
- `clearLeaderboard(leaderboard)`

**Analytics:** 🆕
- `trackVisitor(page, visitorId)`
- `trackPageView(page)`
- `trackDAU(userId)`
- `getUniqueVisitors(page)`
- `getDAU()`
- `getEventStats(event)`
- `getAnalyticsSummary()`

**Geospatial:** 🆕
- `addLocation(name, longitude, latitude)`
- `findNearbyLocations(longitude, latitude, radius, unit)`
- `getDistance(location1, location2, unit)`
- `getLocationCoordinates(name)`

**Event Logging:** 🆕
- `logEvent(streamName, eventType, data)`
- `getRecentEvents(streamName, count)`
- `getEventCount(streamName)`
- `getEventsByTimeRange(streamName, start, end)`
- `resetCounter(name)`

**Storage:**
- `saveSetting(key, value, ttl?)`
- `getSetting(key)`
- `listSettings()`
- `deleteSetting(key)`

**Admin:**
- `getRedisStats()`
- `ping()`
- `initDemoData()`
- `clearAllData()`

## Learn More

- [Bun Redis Wrapper Documentation](https://github.com/codecaine-zz/bun_redis_wrapper)
- [Controllers Guide](https://github.com/codecaine-zz/bun_redis_wrapper/blob/main/src/controllers/README.md)
- [Example Application](https://github.com/codecaine-zz/bun_redis_wrapper/blob/main/demos/14-controller-app.ts)
- [Redis Documentation](https://redis.io/documentation)

## Notes

- The demo uses a namespace prefix to isolate data: `bun_rpc_demo`
- All sessions have a default TTL of 1 hour (3600 seconds)
- Cache entries expire after 5 minutes (300 seconds)
- Rate limit is set to 10 requests per minute by default
- Statistics are automatically updated in real-time
