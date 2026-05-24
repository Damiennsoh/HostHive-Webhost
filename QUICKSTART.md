# HostHive Quick Start Checklist

Get HostHive running in minutes with this comprehensive checklist.

## Pre-Flight Checks

- [ ] Node.js 20+ installed (`node --version`)
- [ ] Docker & Docker Compose installed (`docker --version`)
- [ ] Git installed (`git --version`)
- [ ] 4GB+ RAM available
- [ ] Port 3000, 5432, 6379, 8000 are available

## Development Setup (5 minutes)

### 1. Clone Repository
```bash
git clone https://github.com/Damiennsoh/HostHive-Webhost.git
cd HostHive-Webhost
```

### 2. Install Dependencies
```bash
pnpm install
# or: npm install
```

### 3. Copy Environment Template
```bash
cp .env.example .env.local
```

No changes needed for local development!

### 4. Start Services
```bash
# Terminal 1: Start Docker services
docker-compose --profile dev up -d

# Terminal 2: Start Next.js dev server
pnpm dev
```

### 5. Access Dashboard
- **Dashboard**: http://localhost:3000
- **Demo Login**: 
  - Email: `dev@hosthive.app`
  - Password: `password123`

### 6. Verify Services
```bash
# Check all services running
docker-compose ps

# Should see:
# - hosthive-dashboard (Next.js)
# - hosthive-postgres (Database)
# - hosthive-redis (Cache)
```

## Local Database Setup (Optional)

### 1. Access PostgreSQL
```bash
docker-compose exec postgres psql -U hosthive -d hosthive
```

### 2. Initialize Schema
```bash
# From your terminal (outside container)
docker-compose exec postgres psql -U hosthive -d hosthive < schema.sql
```

### 3. Insert Sample Data
```sql
INSERT INTO users (email, name) VALUES
  ('dev@hosthive.app', 'Developer'),
  ('test@example.com', 'Test User');
```

## Available Services

| Service | URL | Purpose |
|---------|-----|---------|
| Dashboard | http://localhost:3000 | HostHive web UI |
| Traefik | http://localhost:8080 | Reverse proxy dashboard |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache |
| pgAdmin | http://localhost:5050 | DB management (optional) |

## Test the Application

### Create Your First Project

1. Login to dashboard
2. Click **New Project**
3. Select a GitHub repository
4. Configure project settings
5. Click **Deploy**

### View Deployments

1. Go to **Projects** → Select a project
2. Click **Deployments** tab
3. View deployment history and logs

### Manage Environment Variables

1. Go to **Projects** → Select a project
2. Click **Settings** tab
3. Add/edit environment variables

## Common Commands

### Docker Operations

```bash
# View logs
docker-compose logs -f dashboard
docker-compose logs -f postgres

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: Deletes data!)
docker-compose down -v

# Restart services
docker-compose restart

# Rebuild images
docker-compose build
```

### Database Operations

```bash
# Connect to database
docker-compose exec postgres psql -U hosthive -d hosthive

# Backup database
docker-compose exec postgres pg_dump -U hosthive hosthive > backup.sql

# Restore database
docker-compose exec postgres psql -U hosthive hosthive < backup.sql
```

### Development

```bash
# Run type checking
npm run type-check

# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Production Deployment (15-30 minutes)

### Requirements

- VPS (DigitalOcean, AWS EC2, Linode, etc.)
- Domain name
- SSL certificate (auto-provisioned via Let's Encrypt)

### Quick Deploy to DigitalOcean

#### 1. Create Droplet

```bash
# Create Ubuntu 22.04 droplet with 4GB+ RAM
# SSH into droplet
ssh root@your_droplet_ip
```

#### 2. Install Dependencies

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### 3. Deploy HostHive

```bash
# Clone repository
git clone https://github.com/Damiennsoh/HostHive-Webhost.git /app/hosthive
cd /app/hosthive

# Configure environment
cp .env.example .env.production
nano .env.production  # Edit with your values
```

#### 4. Start Production

```bash
# Load environment variables
set -a && source .env.production && set +a

# Deploy with production profile
docker-compose --profile production up -d

# Verify
docker-compose ps
```

#### 5. Configure Domain

Update DNS records:

```
A record: hosthive.example.com → your_droplet_ip
CNAME: *.hosthive.example.com → hosthive.example.com
```

Access at: https://hosthive.example.com

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Test database
docker-compose exec postgres pg_isready -U hosthive

# Check logs
docker-compose logs postgres
```

### Services Won't Start

```bash
# Clean up old containers
docker system prune -a

# Rebuild and start fresh
docker-compose build
docker-compose --profile dev up -d
```

### Out of Memory

```bash
# Check Docker memory
docker system df

# Increase Docker memory limit in Docker Desktop settings
# Or edit docker-compose.yml:
# services:
#   dashboard:
#     mem_limit: 2g
```

## Next Steps

1. **Explore Dashboard** - Familiarize yourself with the UI
2. **Create Test Project** - Deploy a sample app
3. **Read Documentation** - Check DEPLOYMENT.md and API_REFERENCE.md
4. **Configure GitHub** - Set up GitHub integration
5. **Deploy to Production** - Follow production deployment guide

## Getting Help

- 📖 **Documentation**: See README.md, DEPLOYMENT.md, API_REFERENCE.md
- 🐛 **Issues**: GitHub Issues tracker
- 💬 **Discussions**: GitHub Discussions
- 📧 **Email**: support@hosthive.app

## Quick Reference

### Environment Variables

Key environment variables for `.env.local`:

```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://hosthive:secure_password@localhost:5432/hosthive

# Optional (for features)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
RESEND_API_KEY=your_resend_api_key
```

### API Quick Test

```bash
# Get projects
curl -H "Authorization: Bearer token" \
  http://localhost:3000/api/projects

# Create project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "repository_url": "https://github.com/user/repo",
    "repository_branch": "main",
    "project_type": "node"
  }'
```

## Success Checklist

- [ ] Dashboard loads at http://localhost:3000
- [ ] Can login with demo credentials
- [ ] Can view projects and deployments
- [ ] Database is accessible
- [ ] Docker services are running
- [ ] No errors in console

---

**Ready to deploy? Let's go!** 🚀

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).
