# CMS Customer API

A production-ready Content Management System API built with Clean Architecture principles, featuring customer management with full CRUD operations.


##  Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Docker Setup](#docker-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Performance Optimizations](#performance-optimizations)
- [Contributing](#contributing)

##  Features

-  **Clean Architecture** - Separation of concerns with clear layer boundaries
-  **Type Safety** - Full TypeScript implementation
-  **Validation** - Zod schemas for request validation
-  **Repository Pattern** - Abstract data access layer
-  **Comprehensive Testing** - 82+ unit and integration tests
-  **API Documentation** - OpenAPI/Swagger specification
-  **Docker Ready** - Containerized application
-  **CI/CD Pipeline** - GitHub Actions automation
-  **Performance Optimized** - Database indexing, connection pooling
-  **Security** - Helmet.js, CORS, input sanitization

## 🏛️ Architecture

This project follows **Clean Architecture** principles with four distinct layers:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│    (Controllers, Routes, Middleware)    │
├─────────────────────────────────────────┤
│         Application Layer               │
│      (Business Logic, Services)         │
├─────────────────────────────────────────┤
│         Infrastructure Layer            │
│  (Database, External Services, DI)      │
├─────────────────────────────────────────┤
│           Domain Layer                  │
│     (Entities, Interfaces, DTOs)        │
└─────────────────────────────────────────┘
```

### Layer Responsibilities

- **Domain Layer**: Core business entities and repository interfaces
- **Application Layer**: Business logic, validation, and orchestration
- **Infrastructure Layer**: Database implementation, external integrations
- **Presentation Layer**: HTTP handling, routing, request/response transformation

##  Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.3
- **Framework**: Express.js 4.18
- **Database**: PostgreSQL 15+
- **Validation**: Zod 3.22
- **Testing**: Vitest 1.0
- **Documentation**: Swagger/OpenAPI 3.0
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions

##  Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **PostgreSQL** >= 15.0 ([Download](https://www.postgresql.org/download/))
- **Docker** (optional) >= 24.0 ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

##  Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/cms-customer-api.git
cd cms-customer-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cms_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3001
```

##  Database Setup

### Option 1: Automated Setup (Recommended)

```bash
# Complete setup (migrations + seed data)
npm run db:setup
```

### Option 2: Manual Setup

```bash
# 1. Create database
createdb cms_db

# 2. Run migrations
npm run migrate:up

# 3. Seed database (optional)
npm run seed
```

### Database Commands

```bash
npm run migrate:up      # Run all migrations
npm run migrate:down    # Rollback migrations
npm run seed           # Insert sample data
npm run seed:clear     # Clear all customer data
npm run db:reset       # Complete reset (drop → migrate → seed)
```

### Verify Database Connection

```bash
tsx test-connection.ts
```

##  Running the Application

### Development Mode

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-10T10:30:00.000Z"
}
```

##  Running Tests

### Run All Tests

```bash
npm test
```

### Watch Mode (for development)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/` directory.

### Test UI (Interactive)

```bash
npm run test:ui
```

### Test Structure

```
src/tests/
├── infrastructure/     # Repository tests (15 tests)
├── application/        # Service layer tests (28 tests)
├── presentation/       # Controller tests (12 tests)
├── integration/        # API endpoint tests (15 tests)
└── helpers/           # Mock data and utilities

Total: 82+ comprehensive tests
```

##  API Documentation

### Swagger UI

Once the application is running, visit:

```
http://localhost:5000/api-docs
```

### API Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/customers` | Create a new customer |
| `GET` | `/api/customers` | Get all customers (paginated) |
| `GET` | `/api/customers/:id` | Get customer by ID |
| `PUT` | `/api/customers/:id` | Update customer |
| `DELETE` | `/api/customers/:id` | Delete customer |

### Example Requests

#### Create Customer
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+1-555-0101",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA"
  }'
```

#### Get All Customers
```bash
curl http://localhost:3000/api/customers?limit=10&offset=0
```

#### Get Customer by ID
```bash
curl http://localhost:3000/api/customers/{customerId}
```

#### Update Customer
```bash
curl -X PUT http://localhost:3000/api/customers/{customerId} \
  -H "Content-Type: application/json" \
  -d '{
    "city": "San Francisco",
    "state": "CA"
  }'
```

#### Delete Customer
```bash
curl -X DELETE http://localhost:3000/api/customers/{customerId}
```

##  Docker Setup

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

The application will be available at `http://localhost:3000`

### Using Docker Manually

```bash
# Build image
docker build -t cms-customer-api .

# Run container
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PASSWORD=your_password \
  cms-customer-api
```

### Docker Commands

```bash
# View running containers
docker ps

# Access container shell
docker exec -it cms-customer-api sh

# View container logs
docker logs -f cms-customer-api

# Remove all containers and volumes
docker-compose down -v
```

##  CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment.

### Pipeline Stages

1. **Lint** - Code quality checks
2. **Test** - Run all unit and integration tests
3. **Build** - TypeScript compilation
4. **Docker** - Build and push Docker image
5. **Deploy** - Deploy to staging/production

### Workflow Files

- `.github/workflows/ci.yml` - Main CI pipeline
- `.github/workflows/deploy.yml` - Deployment pipeline

### Manual Workflow Trigger

```bash
# Push to main branch
git push origin main

# Or create a pull request
git checkout -b feature/new-feature
git push origin feature/new-feature
```

### Environment Secrets

Configure these in GitHub repository settings:

- `DB_PASSWORD` - Database password
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub token
- `DEPLOY_KEY` - SSH key for deployment

##  Project Structure

```
cms-customer-api/
├── src/
│   ├── domain/                    # Domain layer
│   │   ├── entities/              # Business entities
│   │   └── repositories/          # Repository interfaces
│   ├── application/               # Application layer
│   │   └── services/              # Business logic
│   ├── infrastructure/            # Infrastructure layer
│   │   ├── database/              # Database config & migrations
│   │   ├── repositories/          # Repository implementations
│   │   └── container/             # Dependency injection
│   ├── presentation/              # Presentation layer
│   │   ├── controllers/           # HTTP controllers
│   │   ├── routes/                # Route definitions
│   │   ├── middleware/            # Express middleware
│   │   └── validators/            # Zod schemas
│   ├── shared/                    # Shared utilities
│   │   └── errors/                # Custom error classes
│   ├── tests/                     # Test files
│   ├── app.ts                     # Express app setup
│   └── server.ts                  # Entry point
├── .github/workflows/             # CI/CD pipelines
├── coverage/                      # Test coverage reports
├── dist/                          # Compiled JavaScript
├── docker-compose.yml             # Docker Compose config
├── Dockerfile                     # Docker image definition
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── vitest.config.ts              # Test configuration
└── README.md                      # This file
```

##  Performance Optimizations

### Database Optimizations

1. **Connection Pooling**
   - Max 20 connections
   - Idle timeout: 30s
   - Connection timeout: 2s

2. **Indexes**
   ```sql
   CREATE INDEX idx_customers_email ON customers(email);
   CREATE INDEX idx_customers_date_created ON customers(date_created DESC);
   CREATE INDEX idx_customers_last_name ON customers(last_name);
   ```

3. **Query Optimization**
   - Pagination with LIMIT/OFFSET
   - Selective column retrieval
   - Prepared statements (parameterized queries)

### Application Optimizations

1. **Async/Await** - Non-blocking I/O operations
2. **Error Handling** - Centralized error middleware
3. **Validation** - Early request validation with Zod

### Production Recommendations

```typescript
// Enable compression
app.use(compression());

// Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

```

##  Security Features

-  Helmet.js for security headers
-  CORS configuration
-  Input validation and sanitization
-  Parameterized SQL queries (SQL injection prevention)
-  Environment variable security

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow existing code patterns
- Write tests for new features
- Update documentation
- Run linter: `npm run lint`
- Format code: `npm run format`

##  License

This project is licensed under the ISC License.

##  Authors

- Hushani Weerasinghe


##  Support

For issues and questions:
- Create an issue on GitHub
- Email: hushanid@gmail.com

---
