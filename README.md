[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/i-wkgGqr)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=20884468)
# expressjs_assignment# Comic API Assignment

A RESTful API built with Express.js that serves XKCD comics with search functionality, caching, and usage statistics.

## Assignment Status

This assignment requires implementing several key features:

- ✅ Health check endpoint (provided)
- ✅ Get latest comic endpoint (provided)
- ❌ Get comic by ID endpoint (TODO)
- ❌ Random comic endpoint (TODO)
- ❌ Comic search functionality (TODO)
- ❌ API usage statistics (TODO)
- ❌ Error handling middleware (TODO)
- ❌ Request logging middleware (TODO)

## Setup Instructions

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd comic-api-assignment
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env file if needed
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Server will run on http://localhost:3000

4. **Run Tests**
   ```bash
   npm test              # Run all tests
   npm run test:watch    # Watch mode
   npm run test:coverage # With coverage report
   ```

## Project Structure

```
project/
├── src/
│   ├── app.js                    # Main application (NEEDS STATS IMPLEMENTATION)
│   ├── routes/
│   │   └── comics.js            # Route handlers (INCOMPLETE)
│   ├── middleware/
│   │   ├── logging.js           # Request logging (INCOMPLETE)
│   │   └── errorHandler.js      # Error handling (INCOMPLETE)
│   └── services/
│       └── xkcdService.js       # XKCD API service (INCOMPLETE)
├── tests/                       # Test files (PROVIDED)
│   ├── integration/
│   │   └── api.test.js         # Integration tests
│   ├── unit/
│   │   └── xkcdService.test.js # Unit tests
│   └── setup.js                # Test configuration
├── public/
│   └── index.html              # API documentation
├── package.json                # Dependencies and scripts
├── jest.config.js              # Test configuration
├── .env.example                # Environment variables template
└── README.md                   # This file
```

## Implementation Requirements

### 1. Complete XKCDService Methods (`src/services/xkcdService.js`)

**`async getById(id)`**
```javascript
// Validation requirements:
// - id must be a positive integer
// - Throw "Invalid comic ID" for invalid inputs

// Implementation requirements:
// - Check cache first using key `comic-${id}`
// - Fetch from `https://xkcd.com/${id}/info.0.json`
// - Handle 404 errors by throwing "Comic not found"
// - Handle other HTTP errors appropriately
// - Cache successful responses
// - Return processed comic object
```

**`async getRandom()`**
```javascript
// Implementation requirements:
// - Get latest comic to determine maximum ID
// - Generate random number between 1 and latest.id
// - Use getById() to fetch the random comic
// - Handle any errors from getById()
```

**`async search(query, page = 1, limit = 10)`**
```javascript
// Implementation requirements:
// - Validate query parameter (1-100 characters)
// - Calculate offset: (page - 1) * limit
// - Search recent comics (last 100) for matches
// - Match against title and transcript (case-insensitive)
// - Return object with: query, results[], total, pagination{}
// - Handle errors gracefully
```

### 2. Complete Route Handlers (`src/routes/comics.js`)

**GET `/api/comics/:id`**
- Remove the 501 status response
- Parse `req.params.id` to integer
- Call `xkcdService.getById(parsedId)`
- Return the comic as JSON
- Let middleware handle errors

**GET `/api/comics/random`**
- Remove the 501 status response  
- Call `xkcdService.getRandom()`
- Return the comic as JSON
- Let middleware handle errors

**GET `/api/comics/search`**
- Remove the 501 status response
- Extract `q`, `page`, `limit` from `req.query`
- Set defaults: `page = 1`, `limit = 10`
- Call `xkcdService.search(q, page, limit)`
- Return search results as JSON
- Let middleware handle errors

### 3. Complete Middleware

**Logging Middleware (`src/middleware/logging.js`)**
```javascript
// Implementation requirements:
// - Generate unique request ID: Math.random().toString(36).substr(2, 9)
// - Set req.requestId and req.startTime = Date.now()
// - Log incoming request with winston:
//   - requestId, method, url, ip, userAgent
// - Call next() to continue
```

**Error Handler (`src/middleware/errorHandler.js`)**
```javascript
// Handle these error types:
// 1. ValidationError -> 400 with validation message
// 2. "Comic not found" -> 404 with user-friendly message  
// 3. "Invalid comic ID" -> 400 with validation message
// 4. Operational errors (isOperational: true) -> use err.statusCode
// 5. All others -> 500 with generic message (don't expose internals)

// Always log errors with: message, stack, url, method, requestId
```

### 4. Add Statistics Tracking (`src/app.js`)

**Stats Middleware (after logging middleware):**
```javascript
// Add this middleware after loggingMiddleware:
app.use((req, res, next) => {
  stats.totalRequests++;
  const endpoint = `${req.method} ${req.path}`;
  stats.endpointStats[endpoint] = (stats.endpointStats[endpoint] || 0) + 1;
  next();
});
```

**Stats Endpoint:**
```javascript
// Replace the 501 response in GET /api/stats with:
app.get('/api/stats', (req, res) => {
  res.json({
    totalRequests: stats.totalRequests,
    endpointStats: stats.endpointStats,
    uptime: (Date.now() - stats.startTime) / 1000
  });
});
```

## API Endpoints Overview

| Method | Endpoint | Description | Status |
|--------|----------|-------------|---------|
| GET | `/api/health` | Health check | ✅ Complete |
| GET | `/api/comics/latest` | Get latest comic | ✅ Complete |
| GET | `/api/comics/:id` | Get comic by ID | ❌ Returns 501 |
| GET | `/api/comics/random` | Get random comic | ❌ Returns 501 |
| GET | `/api/comics/search` | Search comics | ❌ Returns 501 |
| GET | `/api/stats` | API statistics | ❌ Returns 501 |
| GET | `/` | Documentation | ✅ Complete |

## Testing Strategy

Your implementation will be tested against:

**Integration Tests** (`tests/integration/api.test.js`):
- All endpoint functionality
- Error handling and status codes  
- Request validation
- Response format validation

**Unit Tests** (`tests/unit/xkcdService.test.js`):
- Service method implementations
- Caching behavior
- Error handling
- Input validation

### Running Tests Effectively

```bash
# Run specific test files
npx jest tests/integration/api.test.js
npx jest tests/unit/xkcdService.test.js

# Run tests matching a pattern
npx jest --testNamePattern="latest comic"
npx jest --testNamePattern="getById"

# Run with verbose output
npm test -- --verbose

# Run and watch for changes
npm run test:watch
```

## Implementation Tips

### Start Here
1. **Begin with `xkcdService.getById()`** - many features depend on this
2. **Implement error handling early** for better debugging
3. **Test each method individually** as you implement it
4. **Use the test failures** to guide your implementation

### Common Patterns
```javascript
// Error handling in services
if (!id || isNaN(id) || id < 1) {
  throw new Error('Invalid comic ID');
}

// Error handling in routes  
try {
  const result = await service.method();
  res.json(result);
} catch (error) {
  next(error); // Let error middleware handle it
}

// Caching pattern
const cacheKey = `comic-${id}`;
const cached = this.cache.get(cacheKey);
if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
  return cached.data;
}
```

### Debugging Tips
```javascript
// Add temporary logging to understand test failures
console.log('Service method called with:', arguments);
console.log('Response data:', responseData);

// Check what tests expect
// Look at the test assertions to understand required behavior
```

## Common Issues and Solutions

### Tests Failing?

**"Method not implemented" errors:**
- Remove `throw new Error('method not implemented')` lines
- Replace with actual implementation

**Validation errors:**
- Check express-validator usage in routes
- Ensure error middleware handles validation results

**404/500 errors:**
- Verify error messages match test expectations
- Check that error middleware handles different error types

**Cache issues:**
- Ensure cache keys are consistent
- Check timestamp comparisons for cache expiration

### XKCD API Issues

**Rate limiting:**
- Implement proper caching to reduce API calls
- Handle network timeouts gracefully

**Missing comics:**
- Some comic IDs don't exist (404 is expected)
- Handle 404 responses appropriately

## Grading Rubric

### Functionality (40%)
- All endpoints return expected responses
- Proper HTTP status codes
- Error handling works correctly
- Caching implementation

### Code Quality (25%)
- Clean, readable code
- Proper async/await usage
- Consistent error handling
- Following provided patterns

### Testing (20%)
- All tests pass
- Edge cases handled

### Documentation (15%)
- Code comments where needed
- API documentation accessible
- README instructions followed

## Submission Checklist

- [ ] All tests passing (`npm test`)
- [ ] Server starts without errors (`npm start`)
- [ ] API documentation accessible at http://localhost:3000
- [ ] All TODO comments replaced with implementations
- [ ] Error handling works for invalid inputs
- [ ] Caching reduces repeated API calls
- [ ] Statistics tracking functional

## Resources

- [Express.js Documentation](https://expressjs.com/)
- [XKCD JSON API Documentation](https://xkcd.com/json.html)
- [Express Validator](https://express-validator.github.io/)
- [Winston Logging](https://github.com/winstonjs/winston)
- [Jest Testing Framework](https://jestjs.io/)
- [Supertest HTTP Testing](https://github.com/visionmedia/supertest)

## Support

If you encounter issues:

1. Check the test error messages for guidance
2. Review the provided code patterns
3. Verify your implementation matches the requirements
4. Use `console.log()` for debugging (remove before submission)
5. Test individual methods before running full test suite

Remember: The tests are designed to guide your implementation. Use test failures as feedback to understand what's expected.