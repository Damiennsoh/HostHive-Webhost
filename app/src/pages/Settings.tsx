import { useState } from 'react';
import {
  Settings2,
  Bell,
  Shield,
  Key,
  Users,
  CreditCard,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { currentUser } from '@/data/mockData';

interface SettingSection {
  id: string;
  icon: typeof Settings2;
  title: string;
  description: string;
  items: {
    id: string;
    label: string;
    description: string;
    type: 'toggle' | 'link' | 'status';
    value?: boolean;
    status?: string;
    statusColor?: string;
  }[];
}

const settingSections: SettingSection[] = [
  {
    id: 'account',
    icon: Users,
    title: 'Account',
    description: 'Manage your account settings',
    items: [
      {
        id: 'email',
        label: 'Email Address',
        description: currentUser.email,
        type: 'status',
        status: 'Verified',
        statusColor: 'text-emerald-400',
      },
      {
        id: 'plan',
        label: 'Current Plan',
        description: `${currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1)} Plan`,
        type: 'link',
      },
    ],
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Configure email and webhook notifications',
    items: [
      {
        id: 'deploy-success',
        label: 'Deployment Success',
        description: 'Get notified when deployments complete',
        type: 'toggle',
        value: true,
      },
      {
        id: 'deploy-fail',
        label: 'Deployment Failures',
        description: 'Get notified when builds fail',
        type: 'toggle',
        value: true,
      },
      {
        id: 'uptime-alerts',
        label: 'Uptime Alerts',
        description: 'Get notified when services go down',
        type: 'toggle',
        value: true,
      },
      {
        id: 'ssl-expiry',
        label: 'SSL Expiry Warnings',
        description: 'Get notified before SSL certificates expire',
        type: 'toggle',
        value: true,
      },
    ],
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Security',
    description: 'Security and access settings',
    items: [
      {
        id: '2fa',
        label: 'Two-Factor Authentication',
        description: 'Add an extra layer of security',
        type: 'status',
        status: 'Disabled',
        statusColor: 'text-amber-400',
      },
      {
        id: 'api-keys',
        label: 'API Keys',
        description: 'Manage your API access keys',
        type: 'link',
      },
    ],
  },
  {
    id: 'integrations',
    icon: Key,
    title: 'Integrations',
    description: 'Connected services and integrations',
    items: [
      {
        id: 'github',
        label: 'GitHub',
        description: currentUser.githubConnected ? 'Connected' : 'Not connected',
        type: 'status',
        status: currentUser.githubConnected ? 'Connected' : 'Not connected',
        statusColor: currentUser.githubConnected ? 'text-emerald-400' : 'text-amber-400',
      },
      {
        id: 'resend',
        label: 'Resend Email',
        description: 'Transactional email service',
        type: 'status',
        status: 'Active',
        statusColor: 'text-emerald-400',
      },
      {
        id: 'supabase',
        label: 'Supabase',
        description: 'Database and auth service',
        type: 'status',
        status: 'Active',
        statusColor: 'text-emerald-400',
      },
    ],
  },
  {
    id: 'billing',
    icon: CreditCard,
    title: 'Billing',
    description: 'Manage your subscription and billing',
    items: [
      {
        id: 'subscription',
        label: 'Subscription',
        description: `${currentUser.plan.charAt(0).toUpperCase() + currentUser.plan.slice(1)} Plan - $0/month`,
        type: 'link',
      },
      {
        id: 'usage',
        label: 'Usage This Month',
        description: '12 deployments, 3 projects',
        type: 'status',
        status: 'Within limits',
        statusColor: 'text-emerald-400',
      },
    ],
  },
];

export default function Settings() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'deploy-success': true,
    'deploy-fail': true,
    'uptime-alerts': true,
    'ssl-expiry': true,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-[hsl(240_5%_55%)] mt-1">
          Manage your account, notifications, and integrations
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {settingSections.map((section) => (
          <Card key={section.id} className="card-dark">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <section.icon className="h-5 w-5 text-[hsl(25_95%_53%)]" />
                <div>
                  <CardTitle className="text-white text-base">{section.title}</CardTitle>
                  <p className="text-xs text-[hsl(240_5%_55%)]">{section.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[hsl(240_8%_10%)] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-[hsl(240_5%_55%)] mt-0.5">{item.description}</p>
                  </div>
                  {item.type === 'toggle' && (
                    <button
                      onClick={() =>
                        setToggles((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                      }
                      className="flex-shrink-0"
                    >
                      {toggles[item.id] ? (
                        <ToggleRight className="h-6 w-6 text-[hsl(25_95%_53%)]" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-[hsl(240_5%_35%)]" />
                      )}
                    </button>
                  )}
                  {item.type === 'link' && (
                    <ChevronRight className="h-4 w-4 text-[hsl(240_5%_45%)]" />
                  )}
                  {item.type === 'status' && (
                    <span className={`text-sm font-medium ${item.statusColor}`}>
                      {item.status}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
