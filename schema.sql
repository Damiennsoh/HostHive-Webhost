-- HostHive Database Schema
-- PostgreSQL Database Initialization Script

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  password_hash VARCHAR(255),
  github_id INTEGER,
  github_username VARCHAR(255),
  github_token TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT email_not_empty CHECK (email != '')
);

-- Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Groups (High-level containers)
CREATE TABLE IF NOT EXISTS project_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table (Services/Apps within a group)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_group_id UUID REFERENCES project_groups(id) ON DELETE CASCADE, -- Link to group
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  repository_url VARCHAR(500) NOT NULL,
  repository_branch VARCHAR(255) DEFAULT 'main',
  project_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  domain VARCHAR(255),
  environment_variables JSONB DEFAULT '{}',
  build_command TEXT,
  start_command TEXT,
  custom_runtime TEXT,
  coolify_uuid VARCHAR(255), -- Link to Coolify
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_deployed_at TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'deleted')),
  CONSTRAINT valid_project_type CHECK (project_type IN ('node', 'python', 'go', 'ruby', 'php', 'static', 'docker'))
);

-- Managed Databases Table
CREATE TABLE IF NOT EXISTS managed_databases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_group_id UUID REFERENCES project_groups(id) ON DELETE SET NULL, -- Link to group
  name VARCHAR(255) NOT NULL,
  db_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'running',
  coolify_uuid VARCHAR(255),
  host TEXT,
  port INTEGER,
  database_name TEXT,
  username TEXT,
  internal_network TEXT,
  connection_url TEXT,
  env_var_key TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL, -- Specifically linked service (deprecated in favor of group)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_db_type CHECK (db_type IN ('postgresql', 'mysql', 'redis'))
);

-- Deployments Table
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  commit_sha VARCHAR(40),
  commit_message TEXT,
  branch VARCHAR(255),
  build_logs TEXT,
  deployment_logs TEXT,
  duration_seconds INTEGER,
  triggered_by VARCHAR(50) DEFAULT 'manual',
  error_message TEXT,
  container_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deployed_at TIMESTAMP,
  CONSTRAINT valid_deployment_status CHECK (status IN ('pending', 'building', 'deploying', 'success', 'failed', 'cancelled')),
  CONSTRAINT valid_trigger CHECK (triggered_by IN ('manual', 'webhook'))
);

-- ... (Rest of existing indexes and triggers)

CREATE INDEX idx_project_groups_user_id ON project_groups(user_id);
CREATE INDEX idx_projects_group_id ON projects(project_group_id);
CREATE INDEX idx_managed_databases_group_id ON managed_databases(project_group_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_project_groups_updated_at
  BEFORE UPDATE ON project_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_managed_databases_updated_at
  BEFORE UPDATE ON managed_databases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Domains Table
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  domain_name VARCHAR(255) UNIQUE NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  ssl_certificate_status VARCHAR(50) DEFAULT 'pending',
  verified BOOLEAN DEFAULT FALSE,
  dns_verified_at TIMESTAMP,
  ssl_certificate_text TEXT,
  ssl_key_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_ssl_status CHECK (ssl_certificate_status IN ('pending', 'active', 'expired', 'failed'))
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Health Checks Table
CREATE TABLE IF NOT EXISTS health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'unknown',
  response_time_ms INTEGER,
  last_checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  error_message TEXT,
  CONSTRAINT valid_health_status CHECK (status IN ('up', 'down', 'degraded', 'unknown'))
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_notification_type CHECK (type IN ('deployment_success', 'deployment_failed', 'health_alert', 'billing', 'system'))
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  action VARCHAR(255),
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_deployments_project_id ON deployments(project_id);
CREATE INDEX idx_deployments_status ON deployments(status);
CREATE INDEX idx_deployments_created_at ON deployments(created_at DESC);
CREATE INDEX idx_domains_project_id ON domains(project_id);
CREATE INDEX idx_domains_domain_name ON domains(domain_name);
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_health_checks_project_id ON health_checks(project_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_project_id ON audit_logs(project_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deployments_updated_at
  BEFORE UPDATE ON deployments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domains_updated_at
  BEFORE UPDATE ON domains
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
CREATE OR REPLACE VIEW v_user_projects AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  p.description,
  p.project_type,
  p.status,
  p.domain,
  (SELECT COUNT(*) FROM deployments WHERE project_id = p.id) as deployment_count,
  (SELECT MAX(created_at) FROM deployments WHERE project_id = p.id) as last_deployment_date,
  p.created_at,
  p.updated_at
FROM projects p;

CREATE OR REPLACE VIEW v_deployment_history AS
SELECT 
  d.id,
  d.project_id,
  p.name as project_name,
  d.status,
  d.commit_sha,
  d.branch,
  d.duration_seconds,
  d.triggered_by,
  d.created_at,
  d.deployed_at
FROM deployments d
LEFT JOIN projects p ON d.project_id = p.id
ORDER BY d.created_at DESC;

-- Add sample data for development (optional)
-- Uncomment to seed database with sample data

-- INSERT INTO users (email, name) VALUES
-- ('dev@hosthive.app', 'Developer'),
-- ('test@example.com', 'Test User');

-- INSERT INTO projects (user_id, name, repository_url, repository_branch, project_type)
-- SELECT id, 'Sample Project', 'https://github.com/example/repo', 'main', 'node'
-- FROM users LIMIT 1;
