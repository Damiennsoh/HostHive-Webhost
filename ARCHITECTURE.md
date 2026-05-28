# Lynx Host Architecture

## System Design Overview

Lynx Host is built as a composable PaaS platform that combines proven open-source tools with a modern web interface.

```
┌─────────────────────────────────────────────────────────────────┐
│                      User Browser                                │
│              (Desktop, Tablet, Mobile)                           │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS
                   ┌──────────▼──────────┐
                   │   Cloudflare CDN    │
                   │  (Optional Cache)   │
                   └──────────┬──────────┘
                              │
                   ┌──────────▼──────────┐
                   │  Traefik Proxy      │
                   │ - Route traffic     │
                   │ - SSL/TLS           │
                   │ - Load balance      │
                   └──────────┬──────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼────────┐    │      ┌──────▼─────────┐
        │  Lynx Host      │    │      │  Coolify API   │
        │  Dashboard     │    │      │  (Deployments) │
        │ (Next.js)      │    │      └────────────────┘
        └────────┬───────┘    │
                 │            │
        ┌────────▼────────────┼────────┐
        │   Docker Network    │        │
        │   (lynxhost-network)│        │
        │                     │        │
        │  ┌──────────────┐   │        │
        │  │  PostgreSQL  │◄──┼──┐    │
        │  │  (Database)  │   │  │    │
        │  └──────────────┘   │  │    │
        │                     │  │    │
        │  ┌──────────────┐   │  │    │
        │  │   Redis      │◄──┼──┤    │
        │  │ (Caching)    │   │  │    │
        │  └──────────────┘   │  │    │
        │                     │  │    │
        │  ┌──────────────────▼──┐   │
        │  │  Coolify v4          │   │
        │  │ - Git Integration    │   │
        │  │ - Build System       │   │
        │  │ - Container Mgmt     │   │
        │  │ - SSL Provisioning   │   │
        │  └──────────────────────┘   │
        │                             │
        └─────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │   Docker Host           │
        │  (VPS or Kubernetes)    │
        │                         │
        │  ┌───────────────────┐  │
        │  │  User Projects    │  │
        │  │ (Deployed Containers)│
        │  │ - Node.js         │  │
        │  │ - Python          │  │
        │  │ - Go              │  │
        │  │ - Ruby            │  │
        │  │ - Static Sites    │  │
        │  └───────────────────┘  │
        │                         │
        └─────────────────────────┘
```

## Component Architecture

### 1. Frontend Layer (Next.js Dashboard)

**Technology**: Next.js 16 + React 19 + TypeScript + Tailwind CSS

**Key Directories**:
- `app/(auth)/` - Authentication pages
- `app/(dashboard)/` - Protected dashboard routes
- `components/` - React components (shadcn/ui)
- `lib/` - Utilities and API client

**Features**:
- Server-side rendering for SEO
- Client-side interactivity with React
- Mobile-first responsive design
- Real-time updates via WebSocket (future)
- Dark mode support

### 2. API Layer (Next.js API Routes)

**Location**: `app/api/`

**Endpoints**:
```
/api/auth/*          - Authentication
/api/projects/*      - Project CRUD operations
/api/deployments/*   - Deployment management
/api/projects/*/env  - Environment variables
/api/projects/*/domains - Domain management
/api/health          - Health checks
```

**Features**:
- RESTful API design
- JWT authentication
- Request validation
- Error handling
- Rate limiting (future)

### 3. Data Layer

**PostgreSQL Database**:
- Users and authentication
- Projects and configurations
- Deployments and logs
- Domains and SSL certificates
- API keys and tokens

**Redis Cache**:
- Session storage
- API response caching
- Rate limit counters
- Deployment queue

### 4. Deployment Engine (Coolify v4)

**Role**: Orchestrates application deployments

**Responsibilities**:
- Git integration (GitHub webhooks)
- Automatic build detection (Nixpacks)
- Docker container creation
- Environment variable injection
- SSL certificate provisioning (Let's Encrypt)
- Log aggregation
- Health monitoring

**API Integration**:
- Lynx Host calls Coolify API for deployment operations
- Webhook notifications on deployment status changes

### 5. Reverse Proxy (Traefik)

**Role**: Intelligent routing and SSL termination

**Features**:
- Dynamic service discovery from Docker
- Automatic SSL with Let's Encrypt
- Path-based and domain-based routing
- Load balancing
- Health checks

## Data Flow

### Project Creation Flow

```
1. User submits form
   ↓
2. Frontend validates input
   ↓
3. POST /api/projects
   ↓
4. API validates & stores in PostgreSQL
   ↓
5. API returns project ID
   ↓
6. Dashboard redirects to project details
```

### Deployment Flow

```
1. GitHub push event
   ↓
2. Webhook → Coolify
   ↓
3. Coolify clones repo
   ↓
4. Nixpacks detects framework
   ↓
5. Coolify builds Docker image
   ↓
6. Coolify runs container
   ↓
7. Traefik discovers container
   ↓
8. Traefik routes traffic
   ↓
9. Let's Encrypt issues SSL
   ↓
10. Lynx Host receives webhook notification
    ↓
11. Update deployment status in DB
    ↓
12. Dashboard shows deployment success
```

## Authentication & Security

### JWT Flow

```
1. User logs in with email/password
   ↓
2. API validates credentials
   ↓
3. API generates JWT token
   ↓
4. Client stores token in localStorage
   ↓
5. Client includes token in API headers
   ↓
6. API validates token on each request
```

### Secret Management

```
Sensitive data flow:
1. User enters secret in dashboard
   ↓
2. Frontend sends via HTTPS
   ↓
3. API encrypts before storing in DB
   ↓
4. Coolify retrieves encrypted secret
   ↓
5. Coolify decrypts and injects into container
   ↓
6. Secret never logged or exposed
```

## Scaling Architecture

### Phase 1: Single Server (MVP)
- Dashboard + API + Coolify on one Docker host
- PostgreSQL single instance
- Redis single instance
- Traefik handles routing

### Phase 2: Distributed Services
```
Load Balancer (Nginx/HAProxy)
    ├─ Dashboard servers (N replicas)
    ├─ API servers (N replicas)
    ├─ Coolify cluster (HA setup)
    ├─ PostgreSQL (replication)
    └─ Redis (cluster mode)
```

### Phase 3: Kubernetes
```
Kubernetes Cluster
├─ Dashboard (Deployment)
├─ API (Deployment)
├─ Coolify (StatefulSet)
├─ PostgreSQL (Managed service)
├─ Redis (Managed service)
└─ Ingress (Traefik/Nginx)
```

## Database Schema

### Users Table
```sql
id (UUID)
email (unique)
name
avatar_url
password_hash (bcrypt)
created_at
updated_at
```

### Projects Table
```sql
id (UUID)
user_id (FK users)
name
repository_url
repository_branch
project_type
status
domain
environment_variables (JSONB)
created_at
updated_at
last_deployed_at
```

### Deployments Table
```sql
id (UUID)
project_id (FK projects)
status
commit_sha
commit_message
branch
build_logs (TEXT)
deployment_logs (TEXT)
duration_seconds
triggered_by ('manual'|'webhook')
created_at
updated_at
deployed_at
```

## API Integration Points

### Incoming Webhooks
- **GitHub**: Push/PR events trigger deployments
- **Coolify**: Deployment status updates

### Outgoing Webhooks
- **Resend**: Send email notifications
- **Uptime Kuma**: Send health check pings
- **Custom**: User-defined webhooks

## Performance Optimization

### Frontend
- Next.js static generation where possible
- Image optimization
- Code splitting
- Component-level suspense
- Service worker (PWA)

### Backend
- Database query optimization with indexes
- Redis caching for frequently accessed data
- Async/await for non-blocking operations
- Batch operations for deployments

### Infrastructure
- Docker layer caching
- Multi-stage builds
- CDN for static assets (optional)
- Horizontal scaling via load balancer

## Monitoring & Observability

### Health Checks
- `/api/health` - System status
- Traefik health endpoints
- Database connectivity tests
- Redis connectivity tests

### Logging
- Application logs → Docker logs
- Deployment logs → PostgreSQL
- Access logs → Traefik
- Error tracking → Sentry (optional)

### Metrics
- Dashboard metrics → Prometheus (optional)
- Performance metrics → DataDog (optional)
- Custom metrics → Influx (optional)

## Future Enhancements

### Short Term
- WebSocket for real-time deployment logs
- GraphQL API alternative
- CLI tool for local development
- Advanced role-based access control

### Medium Term
- Kubernetes operator for Lynx Host
- Multi-region deployment
- Advanced monitoring dashboard
- Automated backups

### Long Term
- Machine learning for auto-scaling
- Advanced security features (WAF, DDoS protection)
- Marketplace for extensions
- Enterprise support

## Technology Decisions

### Why Coolify?
- ✅ Open-source (no vendor lock-in)
- ✅ Handles complex deployment logic
- ✅ Git integration out-of-the-box
- ✅ Docker orchestration
- ✅ Active development

### Why Traefik?
- ✅ Dynamic service discovery
- ✅ Automatic SSL provisioning
- ✅ Lightweight and fast
- ✅ Docker-native
- ✅ Easy configuration

### Why Next.js?
- ✅ Full-stack JavaScript
- ✅ Server and client components
- ✅ API routes included
- ✅ Excellent developer experience
- ✅ Great for startups

### Why PostgreSQL?
- ✅ ACID compliance
- ✅ JSONB support
- ✅ Excellent scalability
- ✅ Rich ecosystem
- ✅ Free and open-source

