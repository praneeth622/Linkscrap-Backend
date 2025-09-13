# LinkedIn Data Scraping Backend API

A comprehensive, enterprise-grade backend system for LinkedIn data collection and management, built with NestJS and integrated with BrightData's professional scraping infrastructure.

## 🚀 Repository Overview

This repository provides a robust, scalable backend API for collecting and managing LinkedIn data across multiple categories:

- **People Profiles**: Detailed profile information, experience, education, skills
- **Job Listings**: Job postings, requirements, company information, application details
- **Company Information**: Company profiles, employee counts, industry data
- **LinkedIn Posts**: Posts, articles, engagement metrics, content analysis
- **People Search**: Advanced search capabilities with filters and location targeting

### Architecture Overview

The system follows a modular, microservice-inspired architecture within a monolithic NestJS application:

```
├── src/
│   ├── auth/                 # Supabase authentication & JWT handling
│   ├── brightdata/           # BrightData API integration & DTOs
│   ├── config/               # Rate limiting, Redis, database configuration
│   ├── database/             # Database utilities and migrations
│   ├── entities/             # TypeORM database entities
│   └── linkedin/             # LinkedIn data collection modules
│       ├── people-profile-collect/     # Profile data collection
│       ├── people-profile-discover/    # Profile discovery by search
│       ├── job-listing-collect/        # Job data collection
│       ├── job-listing-discover-*/     # Job discovery (keyword/URL)
│       ├── company-info-collect/       # Company data collection
│       ├── post-collect/               # Post/article collection
│       ├── post-discover-*/            # Post discovery (company/profile/URL)
│       └── people-search-collect/      # Advanced people search
```

## 🛠 Technology Stack

### Core Framework & Language
- **NestJS 11.x** - Progressive Node.js framework with TypeScript
- **TypeScript 5.7+** - Type-safe development with latest features
- **Node.js 18+** - Runtime environment

### Database & ORM
- **PostgreSQL** - Primary database (Neon.tech hosted)
- **TypeORM 0.3+** - Object-relational mapping with entity management
- **Database Migrations** - Automated schema management

### Authentication & Security
- **Supabase Auth** - JWT-based authentication system
- **JWT Tokens** - Secure user session management
- **User Data Isolation** - Complete data segregation by user ID
- **Rate Limiting** - Multi-tier throttling with Redis backing

### Caching & Performance
- **Redis** - Primary caching layer for rate limiting and data caching
- **Memory Store Fallback** - Automatic fallback when Redis unavailable
- **Connection Pooling** - Optimized database connections

### API & Documentation
- **Swagger/OpenAPI 3.0** - Comprehensive API documentation
- **Zod Validation** - Runtime type validation and schema generation
- **RESTful APIs** - Standard HTTP methods and status codes

### External Integrations
- **BrightData API** - Professional LinkedIn scraping infrastructure
- **Multiple Dataset Support** - Different scrapers for different data types

### Development & Testing
- **Jest** - Unit and integration testing framework
- **ESLint + Prettier** - Code quality and formatting
- **Hot Reload** - Development server with auto-restart

## ✨ Key Features

### 🔒 Advanced Rate Limiting
Multi-tier rate limiting system with Redis backing:

- **Health Endpoints**: 60 requests/minute
- **Authentication**: 5 requests/minute
- **Data Collection**: 10 requests/hour (resource-intensive operations)
- **Data Retrieval**: 100 requests/hour
- **Default**: 100 requests/minute

### 🔐 Enterprise Security
- **JWT Authentication** - Supabase-powered secure authentication
- **User Data Isolation** - Complete data segregation per user
- **Bearer Token Authorization** - Industry-standard auth headers
- **Input Validation** - Comprehensive Zod schema validation

### 📊 Comprehensive Data Collection
- **Asynchronous Processing** - Non-blocking data collection with status tracking
- **Snapshot Management** - Track collection progress and retrieve results
- **Data Persistence** - Automatic database storage with relationship mapping
- **Error Handling** - Robust error management and user feedback

### 🐳 Docker Support
- **Multi-stage Builds** - Optimized production images
- **Docker Compose** - Complete development environment
- **Environment Configuration** - Flexible deployment options

## � API Documentation

### Live Documentation
- **Swagger UI**: `http://localhost:3000/api-docs`
- **OpenAPI Spec**: Auto-generated from code annotations

### Authentication
All endpoints (except health checks) require JWT authentication:

```bash
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

### Rate Limiting Headers
API responses include rate limiting information:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1640995200
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+**
- **PostgreSQL 14+** (or use provided Neon.tech connection)
- **Redis** (optional, falls back to memory)
- **Docker & Docker Compose** (for containerized setup)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd link-scrap
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database setup**
```bash
# Database will auto-sync on first run (development)
# For production, disable synchronize and use migrations
```

5. **Start development server**
```bash
npm run start:dev
```

The API will be available at:
- **API**: `http://localhost:3000`
- **Swagger Docs**: `http://localhost:3000/api-docs`

### Docker Setup

1. **Using Docker Compose**
```bash
docker-compose up -d
```

2. **Build custom image**
```bash
docker build -t linkedin-scraper-api .
docker run -p 3000:3000 --env-file .env linkedin-scraper-api
```

## 📖 Usage Examples

### Authentication Flow
```javascript
// 1. Authenticate with Supabase (frontend)
const { data: { session } } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// 2. Use JWT token in API requests
const response = await fetch('http://localhost:3000/linkedin/people-profile/collect', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    urls: ['https://linkedin.com/in/johndoe']
  })
});
```

### Data Collection Workflow
```javascript
// 1. Start data collection
const collection = await fetch('/linkedin/people-profile/collect', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ urls: ['https://linkedin.com/in/johndoe'] })
});
const { snapshot_id } = await collection.json();

// 2. Check status
const status = await fetch(`/linkedin/people-profile/collect/snapshot/${snapshot_id}/status`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 3. Retrieve data when ready
const data = await fetch(`/linkedin/people-profile/collect/snapshot/${snapshot_id}/data`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Complete API Integration Example
```javascript
import LinkedInAPIClient from './gist/api-client-example.js';

const client = new LinkedInAPIClient({
  baseURL: 'http://localhost:3000',
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseKey: 'your-supabase-anon-key'
});

// Authenticate and collect data
await client.authenticate('user@example.com', 'password');
const profiles = await client.collectProfiles(['https://linkedin.com/in/johndoe']);
const jobs = await client.discoverJobsByKeyword({
  keyword: 'Software Engineer',
  location: 'San Francisco, CA'
});
```

## 🔧 Environment Setup

Create a `.env` file in the `link-scrap` directory with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/linkscrap_db

# Supabase Configuration (for Authentication)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# BrightData Configuration (for LinkedIn Scraping)
BRIGHTDATA_API_TOKEN=your-brightdata-token
BRIGHTDATA_CUSTOMER_ID=your-customer-id

# LinkedIn Dataset IDs (from BrightData)
LINKEDIN_PEOPLE_PROFILE_COLLECT_DATASET_ID=your-dataset-id
LINKEDIN_PEOPLE_PROFILE_DISCOVER_DATASET_ID=your-dataset-id
LINKEDIN_COMPANY_INFO_COLLECT_DATASET_ID=your-dataset-id
LINKEDIN_JOB_LISTING_COLLECT_DATASET_ID=your-dataset-id
LINKEDIN_JOB_LISTING_DISCOVER_KEYWORD_DATASET_ID=your-dataset-id
LINKEDIN_JOB_LISTING_DISCOVER_URL_DATASET_ID=your-dataset-id
LINKEDIN_POST_COLLECT_DATASET_ID=your-dataset-id
LINKEDIN_POST_DISCOVER_COMPANY_DATASET_ID=your-dataset-id
LINKEDIN_POST_DISCOVER_PROFILE_DATASET_ID=your-dataset-id
LINKEDIN_POST_DISCOVER_URL_DATASET_ID=your-dataset-id
LINKEDIN_PEOPLE_SEARCH_COLLECT_DATASET_ID=your-dataset-id

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Application Configuration
NODE_ENV=development
PORT=3000
```

## 📚 API Reference

The API provides 11 comprehensive LinkedIn data collection endpoints:

### Core Endpoints

#### Health Check
```http
GET /health
```
**Rate Limit:** 60 requests/minute  
**Authentication:** Not required

### LinkedIn API Endpoints

#### 1. People Profile Collection
- `POST /linkedin/people-profile/collect` - Collect profiles by URLs
- `GET /linkedin/people-profile/collect` - Get all collected profiles
- `GET /linkedin/people-profile/collect/:id` - Get profile by ID
- `GET /linkedin/people-profile/collect/snapshot/:snapshotId/status` - Check status
- `GET /linkedin/people-profile/collect/snapshot/:snapshotId/data` - Get data

#### 2. People Profile Discovery
- `POST /linkedin/people-profile/discover` - Discover profiles by search
- `GET /linkedin/people-profile/discover` - Get discovered profiles

#### 3. Company Information Collection
- `POST /linkedin/company-info/collect` - Collect company info
- `GET /linkedin/company-info/collect` - Get all companies

#### 4. Job Listing Collection
- `POST /linkedin/job-listing/collect` - Collect job listings
- `GET /linkedin/job-listing/collect` - Get all job listings

#### 5. Job Listing Discovery by Keyword
- `POST /linkedin/job-listing/discover-keyword` - Discover by keywords
- `GET /linkedin/job-listing/discover-keyword` - Get discovered jobs

#### 6. Job Listing Discovery by URL
- `POST /linkedin/job-listing/discover-url` - Discover by URLs
- `GET /linkedin/job-listing/discover-url` - Get discovered jobs

#### 7. Post Collection
- `POST /linkedin/post-collect` - Collect posts by URLs
- `GET /linkedin/post-collect` - Get all posts

#### 8. Post Discovery by Company
- `POST /linkedin/post-discover-company` - Discover company posts
- `GET /linkedin/post-discover-company` - Get company posts

#### 9. Post Discovery by Profile
- `POST /linkedin/post-discover-profile` - Discover profile posts
- `GET /linkedin/post-discover-profile` - Get profile posts

#### 10. Post Discovery by URL
- `POST /linkedin/post-discover-url` - Discover posts by URL
- `GET /linkedin/post-discover-url` - Get discovered posts

#### 11. People Search Collection
- `POST /linkedin/people-search-collect` - Search and collect people
- `GET /linkedin/people-search-collect` - Get search results

## 🚦 Rate Limiting

The API implements comprehensive rate limiting:

| Endpoint Type | Limit | Window | Scope |
|---------------|-------|--------|-------|
| Authentication | 5 requests | 1 minute | Per IP |
| Data Collection (POST) | 10 requests | 1 hour | Per User |
| Data Retrieval (GET) | 100 requests | 1 hour | Per User |
| Health/Status | 60 requests | 1 minute | Per IP |
| Default | 100 requests | 1 minute | Per IP |

### Rate Limit Headers

All responses include rate limit information:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`
- `X-RateLimit-Type`

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Run specific test
npm test -- people-profile-collect.e2e-spec.ts
```

### Test Categories

1. **Unit Tests** - Individual components and services
2. **Integration Tests** - API endpoints and database
3. **E2E Tests** - Complete user workflows
4. **Rate Limiting Tests** - Rate limiting functionality
5. **Authentication Tests** - Auth and authorization

## 🐳 Docker Deployment

### Development

```bash
# Start with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Build custom image
docker build -t linkscrap-backend .
```

## ❌ Error Handling

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
- `502` - Bad Gateway (BrightData API issues)

### Error Response Format

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2025-01-12T10:30:45.123Z",
  "path": "/linkedin/people-profile/collect"
}
```

## 🔧 Troubleshooting

### Common Issues

#### Issue: "Only seeing 2 APIs in Swagger"
**Solution:** 
1. Ensure all LinkedIn modules are imported in `app.module.ts`
2. Check that controllers have proper `@ApiTags()` decorators
3. Verify the server is running: `npm run start:dev`
4. Visit: `http://localhost:3000/api-docs`

#### Issue: "Database connection failed"
**Solution:**
1. Check `DATABASE_URL` in `.env`
2. Ensure PostgreSQL is running
3. Verify database exists and credentials are correct

#### Issue: "Authentication failed"
**Solution:**
1. Check Supabase configuration in `.env`
2. Verify JWT token format: `Bearer <token>`
3. Ensure user has valid session

#### Issue: "Rate limit exceeded"
**Solution:**
1. Check rate limit headers in response
2. Wait for rate limit window to reset
3. For development, increase limits in environment variables

#### Issue: "BrightData API errors"
**Solution:**
1. Verify BrightData API token and customer ID
2. Check dataset IDs are correct
3. Ensure BrightData account has sufficient credits

### Debug Mode

Enable debug logging:

```bash
# Set debug environment
NODE_ENV=development DEBUG=* npm run start:dev
```

### Health Check

Monitor system health:

```bash
# Check API health
curl http://localhost:3000/health

# Check specific endpoint
curl -H "Authorization: Bearer <token>" http://localhost:3000/linkedin/people-profile/collect
```

## 🤝 Development

### Project Structure

```
src/
├── app.module.ts                 # Main application module
├── main.ts                       # Application entry point
├── auth/                         # Authentication module
├── common/                       # Shared utilities
├── config/                       # Configuration files
├── linkedin/                     # LinkedIn API modules
│   ├── people-profile-collect/
│   ├── people-profile-discover/
│   ├── company-info-collect/
│   ├── job-listing-collect/
│   ├── job-listing-discover-keyword/
│   ├── job-listing-discover-url/
│   ├── post-collect/
│   ├── post-discover-company/
│   ├── post-discover-profile/
│   ├── post-discover-url/
│   └── people-search-collect/
└── test/                         # Test files
```

### Adding New Endpoints

1. Create new module: `nest g module linkedin/new-endpoint`
2. Create controller: `nest g controller linkedin/new-endpoint`
3. Create service: `nest g service linkedin/new-endpoint`
4. Add rate limiting decorators
5. Add comprehensive tests
6. Update documentation

### Code Style

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint -- --fix
```

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **API Documentation:** http://localhost:3000/api-docs
- **Issues:** GitHub Issues
- **Email:** support@yourcompany.com

---

**Built with ❤️ using NestJS, TypeScript, and BrightData**

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```


