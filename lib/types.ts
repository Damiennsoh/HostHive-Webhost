export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  plan?: 'free' | 'startup' | 'pro' | 'enterprise'
  createdAt: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  avatar?: string
  plan: 'free' | 'pro' | 'enterprise' | 'startup'
}

export interface Project {
  id: string
  name: string
  slug: string
  framework: Framework
  domain: string
  status: DeploymentStatus
  lastDeployment: string
  organizationId: string
  createdAt: string
  description?: string
  repository?: string
  branch?: string
}

export interface Deployment {
  id: string
  projectId: string
  projectName: string
  commit: string
  commitMessage: string
  branch: string
  status: DeploymentStatus
  duration: number
  createdAt: string
  url?: string
  logs?: string[]
}

export interface Domain {
  id: string
  domain: string
  projectId: string
  status: 'active' | 'pending' | 'error'
  ssl: boolean
  createdAt: string
}

export interface EnvironmentVariable {
  id: string
  key: string
  value: string
  isSecret: boolean
  environment: 'production' | 'preview' | 'development'
}

export interface APIKey {
  id: string
  name: string
  key: string
  lastUsed?: string
  createdAt: string
}

export type DeploymentStatus = 'ready' | 'building' | 'error' | 'queued' | 'canceled'

export type Framework = 
  | 'nextjs'
  | 'react'
  | 'vue'
  | 'nuxt'
  | 'svelte'
  | 'nodejs'
  | 'express'
  | 'nestjs'
  | 'python'
  | 'django'
  | 'flask'
  | 'go'
  | 'docker'
  | 'static'

export interface Repository {
  id: string
  name: string
  fullName: string
  owner: string
  private: boolean
  language: string
  updatedAt: string
}

export interface Metrics {
  totalProjects: number
  totalDeployments: number
  totalDomains: number
  bandwidth: string
  requests: string
  buildMinutes: number
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}
