import { useState } from 'react';
import {
  Globe,
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Plus,
  Search,
  ChevronRight,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { domains as initialDomains } from '@/data/mockData';
import type { Domain } from '@/types';

function SSLStatus({ status }: { status: Domain['ssl'] }) {
  if (status === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <AlertTriangle className="h-3 w-3" />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
      <XCircle className="h-3 w-3" />
      Expired
    </span>
  );
}

function DNSStatus({ status }: { status: Domain['dns'] }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Verified
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        Add CNAME
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-red-400">
      <XCircle className="h-3.5 w-3.5" />
      Error
    </span>
  );
}

export default function Domains() {
  const [domains, setDomains] = useState<Domain[]>(initialDomains);
  const [search, setSearch] = useState('');
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [copied, setCopied] = useState(false);

  const filtered = domains.filter(
    (d) =>
      d.domain.toLowerCase().includes(search.toLowerCase()) ||
      d.project.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;
    const domain: Domain = {
      id: `dom_${Date.now()}`,
      domain: newDomain.trim(),
      project: 'Unassigned',
      projectId: '',
      ssl: 'pending',
      dns: 'pending',
      isDefault: false,
    };
    setDomains([domain, ...domains]);
    setNewDomain('');
    setShowAddDomain(false);
  };

  const copyDNSRecord = () => {
    navigator.clipboard.writeText('cname.hostdesk.app');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Domains</h2>
          <p className="text-[hsl(240_5%_55%)] mt-1">
            Manage custom domains and SSL certificates
          </p>
        </div>
        <Dialog open={showAddDomain} onOpenChange={setShowAddDomain}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-white font-medium text-sm hover:opacity-90 transition-opacity">
              <Plus className="h-4 w-4" />
              Add Domain
            </button>
          </DialogTrigger>
          <DialogContent className="bg-[hsl(240_12%_8%)] border-[hsl(240_6%_18%)] text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-[hsl(25_95%_53%)]" />
                Add Custom Domain
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm text-[hsl(240_5%_65%)] mb-1.5 block">Domain Name</label>
                <Input
                  placeholder="example.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="bg-[hsl(240_8%_10%)] border-[hsl(240_6%_18%)] text-white placeholder:text-[hsl(240_5%_45%)] focus-visible:ring-[hsl(25_95%_53%)]"
                />
              </div>
              <div className="bg-[hsl(240_8%_12%)] rounded-lg p-4 border border-[hsl(240_6%_18%)]">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-[hsl(25_95%_53%)] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">DNS Configuration</p>
                    <p className="text-xs text-[hsl(240_5%_55%)] mt-1">
                      Point your domain's CNAME record to:
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-xs bg-[hsl(240_8%_16%)] px-2 py-1 rounded text-[hsl(25_95%_53%)] font-mono">
                        cname.hostdesk.app
                      </code>
                      <button
                        onClick={copyDNSRecord}
                        className="p-1 rounded hover:bg-[hsl(240_8%_16%)] text-[hsl(240_5%_55%)] transition-colors"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddDomain}
                className="w-full py-2.5 rounded-lg gradient-primary text-white font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Add Domain
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(240_5%_55%)]" />
        <Input
          placeholder="Search domains..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[hsl(240_8%_10%)] border-[hsl(240_6%_18%)] text-white placeholder:text-[hsl(240_5%_45%)] focus-visible:ring-[hsl(25_95%_53%)]"
        />
      </div>

      {/* Domains Table */}
      <Card className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(240_6%_14%)]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(240_5%_55%)] uppercase tracking-wider">
                  Domain
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(240_5%_55%)] uppercase tracking-wider">
                  Project
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(240_5%_55%)] uppercase tracking-wider">
                  SSL
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(240_5%_55%)] uppercase tracking-wider">
                  DNS
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(240_5%_55%)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((domain) => (
                <tr
                  key={domain.id}
                  className="border-b border-[hsl(240_6%_14%)] last:border-0 hover:bg-[hsl(240_8%_10%)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-[hsl(240_5%_55%)]" />
                      <span className="text-sm font-medium text-white">{domain.domain}</span>
                      {domain.isDefault && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[hsl(25_95%_53%/0.15)] text-[hsl(25_95%_53%)]">
                          Default
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[hsl(240_5%_65%)]">{domain.project}</span>
                  </td>
                  <td className="px-4 py-3">
                    <SSLStatus status={domain.ssl} />
                  </td>
                  <td className="px-4 py-3">
                    <DNSStatus status={domain.dns} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-[hsl(240_8%_14%)] text-[hsl(240_5%_55%)] hover:text-white transition-colors">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-[hsl(240_8%_14%)] text-[hsl(240_5%_55%)] hover:text-white transition-colors">
                        <Shield className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-10 w-10 text-[hsl(240_5%_35%)] mx-auto mb-3" />
            <p className="text-[hsl(240_5%_55%)]">No domains found</p>
          </div>
        )}
      </Card>

      {/* Domain Tips */}
      <Card className="card-dark">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Info className="h-5 w-5 text-[hsl(25_95%_53%)]" />
            Domain Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              title: 'How to point your domain',
              description: 'Add a CNAME record pointing to cname.hostdesk.app',
            },
            {
              title: 'SSL certificate timeline',
              description: 'Certificates are auto-provisioned within 5 minutes of DNS verification',
            },
            {
              title: 'Subdomain routing',
              description: 'You can configure multiple subdomains for each project',
            },
          ].map((tip) => (
            <button
              key={tip.title}
              className="flex items-center justify-between w-full p-3 rounded-lg bg-[hsl(240_8%_10%)] hover:bg-[hsl(240_8%_14%)] transition-colors text-left group"
            >
              <div>
                <p className="text-sm font-medium text-white group-hover:text-[hsl(25_95%_53%)] transition-colors">
                  {tip.title}
                </p>
                <p className="text-xs text-[hsl(240_5%_55%)] mt-0.5">{tip.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[hsl(240_5%_45%)] group-hover:text-[hsl(25_95%_53%)] transition-colors" />
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
