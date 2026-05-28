# Coolify Integration Guide for LynxHost

Complete guide for integrating Coolify with LynxHost for deployment management.

## What is Coolify?

Coolify is an open-source, self-hosted PaaS platform that handles:
- Git repository integration
- Automatic build detection (Nixpacks)
- Docker container orchestration
- Environment variable management
- SSL/TLS certificate provisioning
- Log aggregation
- Health monitoring

Think of it as the "deployment engine" that does the heavy lifting while LynxHost provides the user interface.

## Architecture

```
LynxHost Dashboard
      ↓
    REST API
      ↓
 Coolify API
      ↓
 Docker Host
      ↓
 User's Applications
```

## Installation

### Option 1: Self-Hosted on VPS

```bash
# SSH into your server
ssh root@your_vps_ip

# Install Coolify using official script
curl -fsSL https://get.coolify.io/install.sh | bash

# Access Coolify dashboard at http://your_vps_ip:8000
```

### Option 2: Docker Compose (Included in LynxHost)

Coolify is already configured in docker-compose.yml:

```yaml
coolify:
  image: ghcr.io/coollabsio/coolify:latest
  ports:
    - "8000:8000"
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
    - coolify-data:/app/storage
```

Start with production profile:
```bash
docker-compose --profile production up -d coolify
```

## Configuration

### 1. Generate Coolify API Token

1. Access Coolify at `http://localhost:8000`
2. Go to **Settings** → **API Tokens**
3. Create a new token
4. Copy the token and add to `.env.local`:

```bash
COOLIFY_API_TOKEN=your_api_token_here
COOLIFY_API_URL=http://coolify:8000
```

### 2. Connect GitHub App

#### Create GitHub App

1. Go to GitHub Settings → Developer settings → GitHub Apps
2. Create new GitHub App with:
   - **Homepage URL**: https://your-hosthive-domain.com
   - **Webhook URL**: https://your-hosthive-domain.com/api/webhooks/github
   - **Permissions**:
     - Contents: Read & Write
     - Webhooks: Read & Write
     - Checks: Read & Write

3. Copy **App ID** and **Private Key**
4. Add to `.env.local`:

```bash
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY=your_private_key
```

#### Add App to Coolify

1. In Coolify dashboard, go to **Settings** → **Server**
2. Add GitHub App credentials
3. Install the app on your GitHub account

## API Integration

### Deploy Application via Coolify

```typescript
// app/api/projects/[id]/deployments/route.ts

import axios from 'axios';

const coolifyAPI = axios.create({
  baseURL: process.env.COOLIFY_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.COOLIFY_API_TOKEN}`,
    'Content-Type': 'application/json',
  }
});

// Trigger deployment
async function triggerDeployment(projectId: string, branch: string) {
  try {
    const response = await coolifyAPI.post(`/api/v1/projects/${projectId}/deployments`, {
      git_branch: branch,
      git_pull: true,
    });
    
    return response.data;
  } catch (error) {
    console.error('Coolify deployment error:', error);
    throw error;
  }
}

// Get deployment status
async function getDeploymentStatus(projectId: string, deploymentId: string) {
  const response = await coolifyAPI.get(
    `/api/v1/projects/${projectId}/deployments/${deploymentId}`
  );
  
  return response.data;
}

// Get logs
async function getDeploymentLogs(projectId: string, deploymentId: string) {
  const response = await coolifyAPI.get(
    `/api/v1/projects/${projectId}/deployments/${deploymentId}/logs`
  );
  
  return response.data;
}
```

### Receive Webhook Notifications

```typescript
// app/api/webhooks/coolify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Receive deployment status updates from Coolify
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-coolify-signature');
    const body = await request.json();
    
    // Verify webhook signature
    const secret = process.env.COOLIFY_WEBHOOK_SECRET || '';
    const hash = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');
    
    if (hash !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    // Handle deployment event
    const { event, data } = body;
    
    switch (event) {
      case 'deployment.started':
        await handleDeploymentStarted(data);
        break;
      case 'deployment.success':
        await handleDeploymentSuccess(data);
        break;
      case 'deployment.failed':
        await handleDeploymentFailed(data);
        break;
      case 'deployment.log':
        await handleDeploymentLog(data);
        break;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Coolify Webhook Error]', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleDeploymentStarted(data: any) {
  // Update deployment status in LynxHost DB
  const { projectId, deploymentId } = data;
  
  // TODO: Update deployment record
  // await db.deployments.update({
  //   where: { id: deploymentId },
  //   data: { status: 'deploying' }
  // });
}

async function handleDeploymentSuccess(data: any) {
  // Update status and send notification
  const { projectId, deploymentId, duration } = data;
  
  // TODO: Update deployment record
  // Send notification to user
  // sendDeploymentSuccessEmail(user.email, projectId);
}

async function handleDeploymentFailed(data: any) {
  // Update status and alert user
  const { projectId, deploymentId, error } = data;
  
  // TODO: Update deployment record with error
  // Send failure notification
}

async function handleDeploymentLog(data: any) {
  // Stream logs in real-time
  const { projectId, deploymentId, log } = data;
  
  // TODO: Append to deployment logs
  // Broadcast to connected WebSocket clients
}
```

## Coolify Project Structure

Within Coolify, projects are organized as:

```
Server (Docker Host)
├─ Project 1
│  ├─ Service (Next.js App)
│  │  ├─ Build: npm run build
│  │  ├─ Start: npm start
│  │  └─ Port: 3000
│  ├─ Database (Optional PostgreSQL)
│  └─ Domains
│     ├─ myapp.hosthive.app
│     └─ custom-domain.com
├─ Project 2
│  └─ ...
└─ Networks
   └─ hosthive-network
```

## Common Coolify API Endpoints

### Projects

```bash
# List projects
GET /api/v1/projects

# Get project details
GET /api/v1/projects/{projectId}

# Create project
POST /api/v1/projects
Body: {
  "name": "my-project",
  "git_repository": "https://github.com/user/repo",
  "git_branch": "main"
}

# Delete project
DELETE /api/v1/projects/{projectId}
```

### Deployments

```bash
# List deployments
GET /api/v1/projects/{projectId}/deployments

# Get deployment details
GET /api/v1/projects/{projectId}/deployments/{deploymentId}

# Trigger deployment
POST /api/v1/projects/{projectId}/deployments
Body: {
  "git_branch": "main",
  "git_pull": true
}

# Get deployment logs
GET /api/v1/projects/{projectId}/deployments/{deploymentId}/logs

# Cancel deployment
POST /api/v1/projects/{projectId}/deployments/{deploymentId}/cancel
```

### Services

```bash
# Create service (application)
POST /api/v1/projects/{projectId}/services
Body: {
  "name": "web-app",
  "image": "node:20-alpine",
  "ports": [3000],
  "environment": {
    "NODE_ENV": "production"
  }
}

# Update service
PATCH /api/v1/projects/{projectId}/services/{serviceId}

# Restart service
POST /api/v1/projects/{projectId}/services/{serviceId}/restart
```

## Environment Variables in Coolify

### Setting Variables via API

```typescript
const response = await coolifyAPI.patch(
  `/api/v1/projects/${projectId}/services/${serviceId}`,
  {
    environment: {
      DATABASE_URL: 'postgresql://...',
      API_KEY: 'secret_key',
      NODE_ENV: 'production'
    }
  }
);
```

### Secret Variables

Store sensitive variables encrypted:

```typescript
const response = await coolifyAPI.post(
  `/api/v1/projects/${projectId}/secrets`,
  {
    name: 'DATABASE_PASSWORD',
    value: 'secure_password',
    is_secret: true
  }
);
```

## Monitoring

### Health Checks

```typescript
// Check application health
const response = await coolifyAPI.get(
  `/api/v1/projects/${projectId}/health`
);

// Returns:
{
  "status": "healthy",
  "containers": {
    "web-app": {
      "status": "running",
      "uptime": "2d 3h",
      "memory": "256 MB"
    }
  }
}
```

### Logs

```typescript
// Stream deployment logs
const logsStream = await coolifyAPI.get(
  `/api/v1/projects/${projectId}/deployments/${deploymentId}/logs/stream`
);

// Or fetch logs
const logs = await coolifyAPI.get(
  `/api/v1/projects/${projectId}/deployments/${deploymentId}/logs`
);
```

## Troubleshooting

### Connection Issues

```bash
# Test Coolify connectivity
curl -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
  http://localhost:8000/api/v1/projects

# Check Coolify logs
docker-compose logs -f coolify

# Verify Docker socket
docker ps
```

### Deployment Failures

```bash
# Check deployment logs in Coolify
curl -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
  http://localhost:8000/api/v1/projects/{id}/deployments/{id}/logs

# Common issues:
# 1. Git authentication failed → Check GitHub App permissions
# 2. Build failed → Check build logs for errors
# 3. Port already in use → Check port mappings
# 4. Out of memory → Increase Docker memory limits
```

### Performance Issues

```bash
# Monitor Coolify resource usage
docker stats coolify

# If high CPU/memory, scale Coolify
# Edit docker-compose.yml:
# cpus: '2'
# mem_limit: 2g
```

## Best Practices

1. **Security**
   - Keep API tokens secret
   - Use environment variables for sensitive data
   - Rotate tokens regularly

2. **Performance**
   - Batch deployments when possible
   - Use caching for frequently accessed data
   - Monitor deployment duration

3. **Reliability**
   - Implement retry logic for failed deployments
   - Set up health checks
   - Monitor service uptime

4. **Maintenance**
   - Keep Coolify updated
   - Monitor disk space
   - Regular backups of databases

## Advanced Features

### Custom Build Steps

```bash
# In Coolify project settings, add custom Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Pre/Post Deployment Hooks

```bash
# Run before deployment
npm run migrate:up

# Run after deployment
npm run seed:db
```

### Secrets Management

```typescript
// Access encrypted secrets in deployment
const dbPassword = process.env.DATABASE_PASSWORD;

// In LynxHost, inject via environment
const secretValue = await decryptSecret(secretName);
await coolifyAPI.patch(`/api/v1/projects/${id}/services/${id}`, {
  environment: {
    DATABASE_PASSWORD: secretValue
  }
});
```

## Support

- **Coolify Documentation**: https://coolify.io/docs
- **GitHub Issues**: https://github.com/coollabsio/coolify
- **Community Discord**: https://discord.gg/coollabs

## Next Steps

1. Deploy LynxHost dashboard
2. Configure Coolify API integration
3. Connect GitHub App
4. Test first deployment
5. Setup monitoring and alerts
