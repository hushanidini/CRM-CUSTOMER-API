# Deployment & Operations Guide

## 🚀 Quick Start Deployment

### Local Development
```bash
# Install dependencies
npm install

# Setup database
npm run db:setup

# Start development server
npm run dev
```

### Docker Deployment
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## 🐳 Docker Commands Reference

### Build & Run
```bash
# Build image
docker build -t cms-customer-api .

# Run container
docker run -p 3000:3000 --env-file .env cms-customer-api

# Run with docker-compose
docker-compose up -d

# Run with pgAdmin for database management
docker-compose --profile tools up -d
```

### Management
```bash
# View running containers
docker ps

# View logs
docker logs cms-customer-api
docker-compose logs -f

# Access container shell
docker exec -it cms-customer-api sh

# Restart services
docker-compose restart

# Remove containers and volumes
docker-compose down -v

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

### Database Management
```bash
# Run migrations in Docker
docker-compose exec app npm run migrate:up

# Seed database
docker-compose exec app npm run seed

# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d cms_db

# Backup database
docker-compose exec postgres pg_dump -U postgres cms_db > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U postgres cms_db
```

## 🔄 CI/CD Pipeline

### GitHub Actions Setup

1. **Add Repository Secrets** (Settings → Secrets and variables → Actions):
   ```
   DB_PASSWORD          # Database password
   DOCKER_USERNAME      # Docker Hub username
   DOCKER_PASSWORD      # Docker Hub access token
   STAGING_HOST         # Staging server IP/domain
   STAGING_USER         # SSH username
   STAGING_SSH_KEY      # SSH private key
   PROD_HOST           # Production server IP/domain
   PROD_USER           # SSH username
   PROD_SSH_KEY        # SSH private key
   SLACK_WEBHOOK       # Slack notification webhook (optional)
   SNYK_TOKEN          # Snyk security token (optional)
   ```

2. **Pipeline Triggers**:
   - **Push to main**: Runs CI + builds Docker image
   - **Pull Request**: Runs CI tests
   - **Tag (v*)**: Deploys to production

### Workflow Overview

```
┌─────────────────┐
│   Push/PR       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Lint & Format  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Run Tests     │
│  with Coverage  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Build TypeScript│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Security Scan   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Build & Push    │
│ Docker Image    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deploy Staging  │
└─────────────────┘
```

### Manual Deployment

#### Staging
```bash
git push origin main
# Automatically deploys to staging
```

#### Production
```bash
# Create and push a tag
git tag v1.0.0
git push origin v1.0.0
# Automatically deploys to production
```

## 🖥️ Server Setup

### Prerequisites
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Initial Server Setup
```bash
# Clone repository
git clone https://github.com/yourusername/cms-customer-api.git
cd cms-customer-api

# Create .env file
cat > .env << EOF
NODE_ENV=production
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=cms_db
DB_USER=postgres
DB_PASSWORD=your_secure_password
CORS_ORIGIN=https://yourdomain.com
EOF

# Start services
docker-compose up -d

# Run migrations
docker-compose exec app npm run migrate:up

# Check health
curl http://localhost:3000/health
```

### SSL/TLS with Nginx

```nginx
# /etc/nginx/sites-available/cms-api
server {
    listen 80;
    server_name api.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /etc/letsencrypt/live/api.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring & Logging

### Health Check Endpoints
```bash
# Basic health check
curl http://localhost:3000/health

# Response:
{
  "status": "ok",
  "timestamp": "2024-01-10T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": "50 MB",
    "heapTotal": "20 MB",
    "heapUsed": "15 MB",
    "external": "2 MB"
  }
}
```

### View Logs
```bash
# Docker logs
docker-compose logs -f app

# Filter by time
docker-compose logs --since 1h app

# Follow specific service
docker-compose logs -f postgres

# Export logs
docker-compose logs app > app.log
```

### Log Format (Production)
```json
{
  "method": "GET",
  "url": "/api/customers",
  "status": "200",
  "responseTime": "45.234ms",
  "contentLength": "1024",
  "timestamp": "2024-01-10T10:30:00.000Z",
  "userAgent": "Mozilla/5.0..."
}
```

## ⚡ Performance Monitoring

### Database Connection Pool
```typescript
// Monitor pool status
const pool = Container.getInstance().dbPool;
console.log('Total connections:', pool.totalCount);
console.log('Idle connections:', pool.idleCount);
console.log('Waiting requests:', pool.waitingCount);
```

### Memory Usage
```bash
# Inside container
docker exec cms-customer-api node -e "console.log(process.memoryUsage())"

# From health endpoint
curl http://localhost:3000/health | jq .memory
```

### Response Times
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/customers

# Using wrk
wrk -t12 -c400 -d30s http://localhost:3000/api/customers
```

## 🔐 Security Checklist

- [ ] Environment variables secured
- [ ] Database password is strong
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Helmet.js configured
- [ ] SSL/TLS certificates installed
- [ ] Database backups configured
- [ ] Security updates applied
- [ ] Firewall rules configured
- [ ] Non-root user for Docker

## 🔄 Rollback Procedures

### Docker Rollback
```bash
# List images
docker images cms-customer-api

# Run previous version
docker run -p 3000:3000 cms-customer-api:previous-tag

# Or with docker-compose
docker-compose down
git checkout previous-tag
docker-compose up -d
```

### Database Rollback
```bash
# Restore from backup
docker-compose exec -T postgres psql -U postgres cms_db < backup_20240110.sql

# Or use migrations
docker-compose exec app npm run migrate:down
```

## 📈 Scaling

### Horizontal Scaling
```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
    # ... rest of config
```

### Load Balancer (Nginx)
```nginx
upstream api_backend {
    least_conn;
    server 10.0.0.1:3000;
    server 10.0.0.2:3000;
    server 10.0.0.3:3000;
}

server {
    location / {
        proxy_pass http://api_backend;
    }
}
```

### Database Read Replicas
```typescript
// Read replica configuration
const readPool = new Pool({
  host: process.env.DB_READ_HOST,
  // ... other config
});

// Use read replica for SELECT queries
const customers = await readPool.query('SELECT * FROM customers');
```

## 🚨 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs app

# Check if port is in use
lsof -i :3000

# Restart services
docker-compose restart
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres pg_isready

# View PostgreSQL logs
docker-compose logs postgres
```

### High Memory Usage
```bash
# Check container stats
docker stats cms-customer-api

# Restart container
docker-compose restart app

# Increase memory limit
docker run -m 512m cms-customer-api
```

## 📞 Support & Maintenance

### Regular Maintenance Tasks
```bash
# Weekly: Update dependencies
npm update
npm audit fix

# Monthly: Database vacuum
docker-compose exec postgres psql -U postgres -d cms_db -c "VACUUM ANALYZE;"

# Monthly: Clean old logs
docker system prune -f

# Quarterly: Review and update security patches
docker-compose pull
docker-compose up -d
```

### Backup Schedule
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres cms_db > backup_$DATE.sql
# Upload to S3 or backup service
```