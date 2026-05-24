// Supabase Database type definitions
// Update after migrations with: supabase gen types typescript

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          github_login: string | null;
          github_token: string | null;
          plan: 'free' | 'hobby' | 'startup' | 'pro' | 'team' | 'enterprise';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          github_login?: string | null;
          github_token?: string | null;
          plan?: 'free' | 'pro' | 'enterprise';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          github_login?: string | null;
          github_token?: string | null;
          plan?: 'free' | 'pro' | 'enterprise';
          updated_at?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          slug: string;
          coolify_uuid: string | null;
          git_repo_url: string;
          git_branch: string;
          git_provider: 'github' | 'gitlab' | 'bitbucket';
          build_command: string | null;
          start_command: string | null;
          root_directory: string | null;
          runtime: 'nixpacks' | 'dockerfile' | 'static';
          custom_domain: string | null;
          assigned_domain: string | null;
          status: 'inactive' | 'deploying' | 'running' | 'stopped' | 'failed';
          framework: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          slug: string;
          coolify_uuid?: string | null;
          git_repo_url: string;
          git_branch?: string;
          git_provider?: 'github' | 'gitlab' | 'bitbucket';
          build_command?: string | null;
          start_command?: string | null;
          root_directory?: string | null;
          runtime?: 'nixpacks' | 'dockerfile' | 'static';
          custom_domain?: string | null;
          assigned_domain?: string | null;
          status?: 'inactive' | 'deploying' | 'running' | 'stopped' | 'failed';
          framework?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          coolify_uuid?: string | null;
          git_branch?: string;
          build_command?: string | null;
          start_command?: string | null;
          root_directory?: string | null;
          runtime?: 'nixpacks' | 'dockerfile' | 'static';
          custom_domain?: string | null;
          assigned_domain?: string | null;
          status?: 'inactive' | 'deploying' | 'running' | 'stopped' | 'failed';
          framework?: string | null;
          is_public?: boolean;
          updated_at?: string;
        };
      };
      deployments: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          coolify_deploy_id: string | null;
          status: 'queued' | 'building' | 'deploying' | 'success' | 'failed' | 'cancelled';
          trigger: 'manual' | 'github_push' | 'github_pr' | 'api';
          commit_sha: string | null;
          commit_message: string | null;
          commit_author: string | null;
          branch: string | null;
          log_url: string | null;
          duration_secs: number | null;
          error_message: string | null;
          started_at: string | null;
          finished_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          coolify_deploy_id?: string | null;
          status?: 'queued' | 'building' | 'deploying' | 'success' | 'failed' | 'cancelled';
          trigger?: 'manual' | 'github_push' | 'github_pr' | 'api';
          commit_sha?: string | null;
          commit_message?: string | null;
          commit_author?: string | null;
          branch?: string | null;
          log_url?: string | null;
          duration_secs?: number | null;
          error_message?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string;
        };
        Update: {
          coolify_deploy_id?: string | null;
          status?: 'queued' | 'building' | 'deploying' | 'success' | 'failed' | 'cancelled';
          log_url?: string | null;
          duration_secs?: number | null;
          error_message?: string | null;
          started_at?: string | null;
          finished_at?: string | null;
        };
      };
      env_vars: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          key: string;
          value: string;
          is_secret: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          key: string;
          value: string;
          is_secret?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string;
          is_secret?: boolean;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          deployment_id: string | null;
          type: 'deploy_success' | 'deploy_failed' | 'uptime_alert' | 'downtime_alert' | 'welcome';
          channel: 'email' | 'webhook' | 'in_app';
          subject: string | null;
          sent_at: string | null;
          status: 'pending' | 'sent' | 'failed';
          resend_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          deployment_id?: string | null;
          type: 'deploy_success' | 'deploy_failed' | 'uptime_alert' | 'downtime_alert' | 'welcome';
          channel?: 'email' | 'webhook' | 'in_app';
          subject?: string | null;
          sent_at?: string | null;
          status?: 'pending' | 'sent' | 'failed';
          resend_id?: string | null;
          created_at?: string;
        };
        Update: {
          sent_at?: string | null;
          status?: 'pending' | 'sent' | 'failed';
          resend_id?: string | null;
        };
      };
      custom_domains: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          domain: string;
          record_type: 'A' | 'CNAME' | 'TXT';
          cname_target: string;
          verification_status: 'pending' | 'verified' | 'failed';
          ssl_status: 'pending' | 'active' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          domain: string;
          record_type?: 'A' | 'CNAME' | 'TXT';
          cname_target: string;
          verification_status?: 'pending' | 'verified' | 'failed';
          ssl_status?: 'pending' | 'active' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          verification_status?: 'pending' | 'verified' | 'failed';
          ssl_status?: 'pending' | 'active' | 'failed';
          updated_at?: string;
        };
      };
      managed_databases: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          name: string;
          db_type: 'postgresql' | 'mysql' | 'redis';
          coolify_uuid: string | null;
          status: 'provisioning' | 'running' | 'stopped' | 'failed';
          host: string | null;
          port: number | null;
          database_name: string | null;
          username: string | null;
          internal_network: string | null;
          connection_url: string | null;
          env_var_key: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          name: string;
          db_type: 'postgresql' | 'mysql' | 'redis';
          coolify_uuid?: string | null;
          status?: 'provisioning' | 'running' | 'stopped' | 'failed';
          host?: string | null;
          port?: number | null;
          database_name?: string | null;
          username?: string | null;
          internal_network?: string | null;
          connection_url?: string | null;
          env_var_key?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          project_id?: string | null;
          status?: 'provisioning' | 'running' | 'stopped' | 'failed';
          connection_url?: string | null;
          updated_at?: string;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type DbProject = Database['public']['Tables']['projects']['Row'];
export type DbDeployment = Database['public']['Tables']['deployments']['Row'];
export type DbEnvVar = Database['public']['Tables']['env_vars']['Row'];
export type DbNotification = Database['public']['Tables']['notifications']['Row'];
export type DbManagedDatabase = Database['public']['Tables']['managed_databases']['Row'];
