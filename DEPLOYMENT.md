# LynxHost Deployment Guide

A comprehensive guide for deploying and running LynxHost - a professional web hosting platform similar to Vercel and Render.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Local Development Setup](#local-development-setup)
4. [Docker Deployment](#docker-deployment)
5. [Production Deployment](#production-deployment)
6. [API Integration](#api-integration)
7. [Database Setup](#database-setup)
8. [Monitoring & Health Checks](#monitoring--health-checks)
9. [Troubleshooting](#troubleshooting)

## Architecture Overview

LynxHost uses a microservices architecture with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                   LynxHost Dashboard                         │
│          (Next.js Frontend + React Components)               │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼────┐          ┌─────▼─────┐
   │ Traefik │          │ LynxHost  │
   │ (Router)│          │   API     │
   └────┬────┘          │ (Express) │
        │               └─────┬─────┘
        │                     │
   ┌────▼─────────────────────▼──────┐
   │   Coolify v4 (Deployment Engine)  │
   │                                    │
   │  ├─ Docker Orchestration          │
   │  ├─ Git Integration (Webhooks)    │
   │  ├─ Build System (Nixpacks)       │
   │  ├─ Container Management          │
   │  └─ SSL/TLS Management            │
   └────┬────────────────────────────┬─┘
        │                            │
   ┌────▼────┐  ┌──────────┐  ┌─────▼──────┐
   │PostgreSQL│  │  Redis   │  │UpTime Kuma │
   │ Database │  │ Caching  │  │ Monitoring │
   └──────────┘  └──────────┘  └────────────┘
```

## Prerequisites

- **Docker & Docker Compose** (v20.10+)
- **Node.js** 20+ and npm/pnpm
- **Git** (for version control)
- **4GB+ RAM** (recommended for local development)
- **Ubuntu 22.04 LTS** or equivalent Linux distribution (for production)

### Optional Services

- **Supabase** - For managed PostgreSQL, auth, and edge functions
- **Vercel** - For serverless backend deployment
- **GitHub** - For Git integration and webhooks
- **Resend** - For email notifications

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/Damiennsoh/LynxHost-Webhost.git
cd LynxHost-Webhost
pnpm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update `.env.local` with your local values:

```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://hosthive:secure_password@localhost:5432/hosthive
REDIS_URL=redis://localhost:6379
```

### 3. Run Development Server

```bash
# Start all services with Docker
docker-compose -f docker-compose.yml --profile dev up -d

# Start Next.js development server
pnpm dev
```

Visit `http://localhost:3000` in your browser.

### 4. Access Services

- **Dashboard**: http://localhost:3000
- **Traefik Dashboard**: http://localhost:8080
- **pgAdmin** (Database UI): http://localhost:5050
- **Redis Commander** (Redis UI): http://localhost:8081

## Docker Deployment

### Build and Run with Docker Compose

```bash
# Start all services (dashboard + supporting services)
docker-compose up -d

# View logs
docker-compose logs -f dashboard

# Stop all services
docker-compose down
```

### Using Production Profile

```bash
# Deploy with Coolify and Traefik (production setup)
docker-compose --profile production up -d

# Environment variables for production
export COOLIFY_SECRET_KEY=your_secret
export LETS_ENCRYPT_EMAIL=your_email@hosthive.app
docker-compose --profile production up -d
```

### Using Development Profile

```bash
# Deploy with PostgreSQL and Redis
docker-compose --profile dev up -d
```

### Build Custom Image

```bash
# Build the Next.js application image
docker build -t hosthive:latest .

# Run the image
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e REDIS_URL=redis://... \
  hosthive:latest
```

## Production Deployment

### Deploy to VPS (DigitalOcean, AWS EC2, Linode)

#### Step 1: Server Setup

```bash
# SSH into your server
ssh root@your_server_ip

# Update system packages
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### Step 2: Clone Repository

```bash
git clone https://github.com/Damiennsoh/LynxHost-Webhost.git /app/hosthive
cd /app/hosthive
```

#### Step 3: Configure Environment

```bash
cp .env.example .env.production
# Edit .env.production with your production values
nano .env.production
```

#### Step 4: Start Services

```bash
# Load environment variables
set -a && source .env.production && set +a

# Deploy with production profile
docker-compose --profile production up -d

# Check status
docker-compose ps
```

#### Step 5: Setup Domain

Update your DNS records to point to your server:

```
A record: hosthive.app -> your_server_ip
CNAME: *.hosthive.app -> hosthive.app
```

### Using Coolify for Deployment

```bash
# Coolify provides a UI for managing deployments
# Access at: http://your_server_ip:8000

# Create a new deployment:
# 1. Connect your GitHub repository
# 2. Select LynxHost project
# 3. Configure build and deploy settings
# 4. Click Deploy
```

## API Integration

### Projects API

```typescript
// Get all projects
GET /api/projects

// Get specific project
GET /api/projects/{id}

// Create new project
POST /api/projects
Body: {
  name: string,
  repository_url: string,
  repository_branch: string,
  project_type: string,
  build_command?: string
}

// Update project
PATCH /api/projects/{id}

// Delete project
DELETE /api/projects/{id}
```

### Deployments API

```typescript
// Get deployments for project
GET /api/projects/{id}/deployments

// Trigger new deployment
POST /api/projects/{id}/deployments
Body: {
  branch: string,
  triggered_by: 'manual' | 'webhook'
}

// Get deployment details
GET /api/deployments/{id}

// Get deployment logs
GET /api/deployments/{id}/logs

// Cancel deployment
POST /api/deployments/{id}/cancel
```

### Environment Variables API

```typescript
// Get environment variables
GET /api/projects/{id}/env

// Create environment variable
POST /api/projects/{id}/env
Body: {
  key: string,
  value: string,
  is_secret: boolean
}

// Delete environment variable
DELETE /api/projects/{id}/env?key=KEY_NAME
```

### Authentication API

```typescript
// Login
POST /api/auth/login
Body: {
  email: string,
  password: string
}

// Register
POST /api/auth/register
Body: {
  email: string,
  password: string,
  name: string
}

// Logout
POST /api/auth/logout
```

## Database Setup

### PostgreSQL Schema

Create the database schema:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  repository_url VARCHAR(500),
  repository_branch VARCHAR(255),
  project_type VARCHAR(50),
  status VARCHAR(50),
  domain VARCHAR(255),
  environment_variables JSONB DEFAULT '{}',
  build_command TEXT,
  start_command TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_deployed_at TIMESTAMP
);

-- Deployments table
CREATE TABLE deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  status VARCHAR(50),
  commit_sha VARCHAR(40),
  commit_message TEXT,
  branch VARCHAR(255),
  build_logs TEXT,
  deployment_logs TEXT,
  duration_seconds INTEGER,
  triggered_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deployed_at TIMESTAMP
);

-- Domains table
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  domain_name VARCHAR(255) UNIQUE,
  is_custom BOOLEAN,
  ssl_certificate_status VARCHAR(50),
  verified BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_deployments_project_id ON deployments(project_id);
CREATE INDEX idx_domains_project_id ON domains(project_id);
```

### Connect to Database

```bash
# Connect with psql
psql postgresql://hosthive:secure_password@localhost:5432/hosthive

# Run migrations
npm run migrate
```

## Monitoring & Health Checks

### Uptime Kuma Configuration

1. Access Uptime Kuma at `http://localhost:3001`
2. Configure health checks for each service:
   - Dashboard: `http://localhost:3000/api/health`
   - Coolify: `http://localhost:8000/health`
   - PostgreSQL: `localhost:5432`

### Health Check Endpoint

```typescript
// GET /api/health
// Returns: { status: 'ok', timestamp: ISO8601, services: {...} }

{
  "status": "ok",
  "timestamp": "2024-05-24T10:30:00Z",
  "services": {
    "database": "ok",
    "redis": "ok",
    "coolify": "ok"
  }
}
```

### Logs and Monitoring

```bash
# View dashboard logs
docker-compose logs -f dashboard

# View all service logs
docker-compose logs -f

# Monitor in real-time
docker stats
```

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Issues

```bash
# Test database connection
docker-compose exec postgres psql -U hosthive -d hosthive -c "SELECT 1"

# Check database logs
docker-compose logs postgres
```

### Build Failures

```bash
# Clear Docker cache and rebuild
docker-compose down -v
docker system prune -a
docker-compose up -d
```

### Memory Issues

```bash
# Increase Docker memory allocation
# Edit docker-compose.yml and add:
# mem_limit: 2g
# memswap_limit: 2g

docker-compose down
docker-compose up -d
```

### Traefik Not Routing Traffic

```bash
# Check Traefik logs
docker-compose logs traefik

# Verify Traefik config
docker-compose exec traefik traefik version
```

## Support & Documentation

- **GitHub Issues**: Report bugs and request features
- **Documentation**: See [docs.hosthive.app](https://docs.hosthive.app)
- **API Reference**: See [/api/docs](#)
- **Community**: Join our Discord for support

## License

MIT License - See LICENSE file for details
