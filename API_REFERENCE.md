# Lynx Host API Reference

Complete API documentation for Lynx Host backend integration.

## Base URL

```
Development: http://localhost:3000/api
Production: https://api.lynxhost.app/api
```

## Authentication

All API endpoints (except auth endpoints) require an `Authorization` header:

```
Authorization: Bearer {JWT_TOKEN}
```

### Get Auth Token

**Endpoint**: `POST /auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):
```json
{
  "success": true,
  "user": {
    "id": "user_001",
    "email": "user@example.com",
    "name": "John Developer",
    "avatar_url": "https://..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-05-31T10:30:00Z"
}
```

---

## Projects

### List Projects

**Endpoint**: `GET /projects`

**Query Parameters**:
- `status` (optional): Filter by status (active, paused, deleted)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response** (200):
```json
{
  "success": true,
  "projects": [
    {
      "id": "proj_001",
      "user_id": "user_001",
      "name": "My Next.js App",
      "description": "Production Next.js application",
      "repository_url": "https://github.com/user/app",
      "repository_branch": "main",
      "project_type": "node",
      "status": "active",
      "domain": "myapp.lynxhost.app",
      "environment_variables": {
        "DATABASE_URL": "postgresql://..."
      },
      "build_command": "npm run build",
      "start_command": "npm start",
      "created_at": "2024-05-15T10:30:00Z",
      "updated_at": "2024-05-20T14:22:00Z",
      "last_deployed_at": "2024-05-20T14:22:00Z"
    }
  ]
}
```

### Get Project Details

**Endpoint**: `GET /projects/{id}`

**Response** (200):
```json
{
  "success": true,
  "project": {
    "id": "proj_001",
    "user_id": "user_001",
    "name": "My Next.js App",
    "description": "Production Next.js application",
    "repository_url": "https://github.com/user/app",
    "repository_branch": "main",
    "project_type": "node",
    "status": "active",
    "domain": "myapp.lynxhost.app",
    "environment_variables": {},
    "build_command": "npm run build",
    "start_command": "npm start",
    "created_at": "2024-05-15T10:30:00Z",
    "updated_at": "2024-05-20T14:22:00Z",
    "last_deployed_at": "2024-05-20T14:22:00Z"
  }
}
```

### Create Project

**Endpoint**: `POST /projects`

**Request**:
```json
{
  "name": "My New App",
  "description": "Production deployment",
  "repository_url": "https://github.com/user/new-app",
  "repository_branch": "main",
  "project_type": "node",
  "build_command": "npm run build",
  "start_command": "npm start"
}
```

**Response** (201):
```json
{
  "success": true,
  "project": {
    "id": "proj_new_123",
    "user_id": "user_001",
    "name": "My New App",
    "description": "Production deployment",
    "repository_url": "https://github.com/user/new-app",
    "repository_branch": "main",
    "project_type": "node",
    "status": "active",
    "domain": "my-new-app.lynxhost.app",
    "environment_variables": {},
    "build_command": "npm run build",
    "start_command": "npm start",
    "created_at": "2024-05-24T10:30:00Z",
    "updated_at": "2024-05-24T10:30:00Z"
  }
}
```

### Update Project

**Endpoint**: `PATCH /projects/{id}`

**Request**:
```json
{
  "name": "Updated App Name",
  "description": "Updated description",
  "environment_variables": {
    "DATABASE_URL": "postgresql://..."
  }
}
```

**Response** (200):
```json
{
  "success": true,
  "project": { ... }
}
```

### Delete Project

**Endpoint**: `DELETE /projects/{id}`

**Response** (200):
```json
{
  "success": true,
  "message": "Project deleted"
}
```

---

## Deployments

### List Deployments

**Endpoint**: `GET /projects/{id}/deployments`

**Query Parameters**:
- `status` (optional): Filter by status (pending, building, success, failed)
- `limit` (optional): Number of results (default: 50)

**Response** (200):
```json
{
  "success": true,
  "deployments": [
    {
      "id": "deploy_001",
      "project_id": "proj_001",
      "status": "success",
      "commit_sha": "abc123def456",
      "commit_message": "Add checkout functionality",
      "branch": "main",
      "build_logs": "[10:22:34] Building...",
      "deployment_logs": "[10:23:15] Deployed...",
      "duration_seconds": 180,
      "triggered_by": "webhook",
      "created_at": "2024-05-20T10:22:00Z",
      "updated_at": "2024-05-20T10:24:00Z",
      "deployed_at": "2024-05-20T10:24:00Z"
    }
  ]
}
```

### Get Deployment Details

**Endpoint**: `GET /api/deployments/{id}`

**Response** (200):
```json
{
  "success": true,
  "deployment": {
    "id": "deploy_001",
    "project_id": "proj_001",
    "status": "success",
    "commit_sha": "abc123def456",
    "commit_message": "Add checkout functionality",
    "branch": "main",
    "build_logs": "[logs...]",
    "deployment_logs": "[logs...]",
    "duration_seconds": 180,
    "triggered_by": "webhook",
    "created_at": "2024-05-20T10:22:00Z",
    "updated_at": "2024-05-20T10:24:00Z",
    "deployed_at": "2024-05-20T10:24:00Z"
  }
}
```

### Trigger Deployment

**Endpoint**: `POST /projects/{id}/deployments`

**Request**:
```json
{
  "branch": "main",
  "commit_sha": "abc123def456",
  "triggered_by": "manual"
}
```

**Response** (201):
```json
{
  "success": true,
  "deployment": {
    "id": "deploy_new_123",
    "project_id": "proj_001",
    "status": "pending",
    "commit_sha": "abc123def456",
    "commit_message": "New deployment",
    "branch": "main",
    "build_logs": "",
    "deployment_logs": "",
    "triggered_by": "manual",
    "created_at": "2024-05-24T10:30:00Z",
    "updated_at": "2024-05-24T10:30:00Z"
  }
}
```

### Get Deployment Logs

**Endpoint**: `GET /api/deployments/{id}/logs`

**Response** (200):
```json
{
  "success": true,
  "logs": {
    "build": [
      "[10:22:34] Building project...",
      "[10:23:12] Build completed successfully"
    ],
    "deployment": [
      "[10:23:15] Starting deployment...",
      "[10:23:45] Health check passed",
      "[10:24:00] Deployment complete"
    ]
  }
}
```

### Cancel Deployment

**Endpoint**: `POST /api/deployments/{id}/cancel`

**Response** (200):
```json
{
  "success": true,
  "message": "Deployment cancellation requested"
}
```

---

## Environment Variables

### List Environment Variables

**Endpoint**: `GET /projects/{id}/env`

**Response** (200):
```json
{
  "success": true,
  "environment_variables": {
    "DATABASE_URL": "postgresql://...",
    "API_KEY": "secret_key",
    "NODE_ENV": "production"
  }
}
```

### Create Environment Variable

**Endpoint**: `POST /projects/{id}/env`

**Request**:
```json
{
  "key": "DATABASE_URL",
  "value": "postgresql://user:pass@localhost/db",
  "is_secret": true
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Environment variable saved",
  "variable": {
    "key": "DATABASE_URL",
    "is_secret": true
  }
}
```

### Delete Environment Variable

**Endpoint**: `DELETE /projects/{id}/env?key=DATABASE_URL`

**Response** (200):
```json
{
  "success": true,
  "message": "Environment variable deleted"
}
```

---

## Domains

### List Domains

**Endpoint**: `GET /projects/{id}/domains`

**Response** (200):
```json
{
  "success": true,
  "domains": [
    {
      "id": "domain_001",
      "project_id": "proj_001",
      "domain_name": "myapp.lynxhost.app",
      "is_custom": false,
      "ssl_certificate_status": "active",
      "verified": true,
      "created_at": "2024-05-15T10:30:00Z",
      "updated_at": "2024-05-20T14:22:00Z"
    }
  ]
}
```

### Add Domain

**Endpoint**: `POST /projects/{id}/domains`

**Request**:
```json
{
  "domain_name": "custom-domain.com",
  "is_custom": true
}
```

**Response** (201):
```json
{
  "success": true,
  "domain": {
    "id": "domain_custom_001",
    "project_id": "proj_001",
    "domain_name": "custom-domain.com",
    "is_custom": true,
    "ssl_certificate_status": "pending",
    "verified": false,
    "created_at": "2024-05-24T10:30:00Z",
    "updated_at": "2024-05-24T10:30:00Z"
  }
}
```

### Remove Domain

**Endpoint**: `DELETE /projects/{id}/domains?domainId=domain_001`

**Response** (200):
```json
{
  "success": true,
  "message": "Domain removed"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong",
  "status": 400
}
```

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |

---

## Webhooks

### GitHub Push Webhook

**Event**: Push to repository

**URL**: `/api/webhooks/github`

**Headers**:
```
X-Hub-Signature-256: sha256=...
```

**Payload**:
```json
{
  "ref": "refs/heads/main",
  "after": "abc123def456",
  "commits": [
    {
      "id": "abc123def456",
      "message": "Add new feature",
      "author": {
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

**Action**: Automatically triggers deployment

---

## Rate Limiting

All API endpoints are rate-limited:

- **Authenticated Users**: 1000 requests per hour
- **Unauthenticated**: 100 requests per hour

Rate limit information is returned in response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1621857600
```

---

## SDK / Client Libraries

### JavaScript/TypeScript

```typescript
import { Lynx HostAPI } from 'lynxhost-sdk';

const client = new Lynx HostAPI({
  token: 'your_jwt_token'
});

// List projects
const projects = await client.projects.list();

// Create project
const newProject = await client.projects.create({
  name: 'My App',
  repository_url: 'https://github.com/user/app',
  repository_branch: 'main',
  project_type: 'node'
});

// Trigger deployment
const deployment = await client.deployments.create('proj_001', {
  branch: 'main',
  triggered_by: 'manual'
});
```

### Python

```python
from lynxhost import Lynx HostAPI

client = Lynx HostAPI(token='your_jwt_token')

# List projects
projects = client.projects.list()

# Create project
project = client.projects.create(
    name='My App',
    repository_url='https://github.com/user/app',
    repository_branch='main',
    project_type='node'
)

# Get deployment logs
logs = client.deployments.get_logs('deploy_001')
```

---

## Support

For API support, issues, or feature requests:
- GitHub Issues: https://github.com/Damiennsoh/HostHive-Webhost/issues
- Email: support@lynxhost.app
- Discord: [Join our community](https://discord.gg/lynxhost)

