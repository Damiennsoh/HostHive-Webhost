import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Variable,
  Plus,
  Search,
  Eye,
  EyeOff,
  Trash2,
  Save,
  ArrowLeft,
  Lock,
  Unlock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { envVars as initialEnvVars, projects } from '@/data/mockData';
import type { EnvVar } from '@/types';

export default function EnvVars() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === projectId);

  const [envVars, setEnvVars] = useState<EnvVar[]>(
    initialEnvVars.filter((e) => e.projectId === projectId)
  );
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newEncrypted, setNewEncrypted] = useState(false);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});

  const filtered = envVars.filter(
    (e) =>
      e.key.toLowerCase().includes(search.toLowerCase()) ||
      e.value.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newKey.trim() || !newValue.trim()) return;
    const env: EnvVar = {
      id: `env_${Date.now()}`,
      key: newKey.trim(),
      value: newValue,
      projectId: projectId || '',
      encrypted: newEncrypted,
    };
    setEnvVars([...envVars, env]);
    setNewKey('');
    setNewValue('');
    setNewEncrypted(false);
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setEnvVars(envVars.filter((e) => e.id !== id));
  };

  const toggleVisibility = (id: string) => {
    setVisibleSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!project) {
    return (
      <div className="text-center py-16">
        <p className="text-[hsl(240_5%_55%)]">Project not found</p>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 text-[hsl(25_95%_53%)] hover:underline"
        >
          Back to projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 rounded-lg hover:bg-[hsl(240_8%_12%)] text-[hsl(240_5%_55%)] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white">Environment Variables</h2>
            <p className="text-[hsl(240_5%_55%)] mt-1">
              Manage environment variables for <span className="text-[hsl(25_95%_53%)]">{project.name}</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-primary text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Add Variable
        </button>
      </div>

      {/* Add New */}
      {showAdd && (
        <Card className="card-dark border-[hsl(25_95%_53%/0.3)]">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="KEY_NAME"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/\s/g, '_'))}
                className="bg-[hsl(240_8%_10%)] border-[hsl(240_6%_18%)] text-white placeholder:text-[hsl(240_5%_45%)] focus-visible:ring-[hsl(25_95%_53%)] font-mono text-sm"
              />
              <Input
                placeholder="value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="bg-[hsl(240_8%_10%)] border-[hsl(240_6%_18%)] text-white placeholder:text-[hsl(240_5%_45%)] focus-visible:ring-[hsl(25_95%_53%)] flex-1"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setNewEncrypted(!newEncrypted)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    newEncrypted
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-[hsl(240_8%_12%)] text-[hsl(240_5%_55%)] border-[hsl(240_6%_18%)]'
                  }`}
                  title={newEncrypted ? 'Encrypted' : 'Not encrypted'}
                >
                  {newEncrypted ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 rounded-lg gradient-primary text-white font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(240_5%_55%)]" />
        <Input
          placeholder="Search variables..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[hsl(240_8%_10%)] border-[hsl(240_6%_18%)] text-white placeholder:text-[hsl(240_5%_45%)] focus-visible:ring-[hsl(25_95%_53%)]"
        />
      </div>

      {/* Env Vars List */}
      <Card className="card-dark">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[hsl(240_6%_14%)]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(240_5%_55%)] uppercase tracking-wider">
                  Key
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(240_5%_55%)] uppercase tracking-wider">
                  Value
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(240_5%_55%)] uppercase tracking-wider">
                  Encrypted
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[hsl(240_5%_55%)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((env) => (
                <tr
                  key={env.id}
                  className="border-b border-[hsl(240_6%_14%)] last:border-0 hover:bg-[hsl(240_8%_10%)] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Variable className="h-4 w-4 text-[hsl(240_5%_55%)]" />
                      <span className="text-sm font-mono font-medium text-white">{env.key}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-[hsl(240_5%_65%)] font-mono">
                      {env.encrypted && !visibleSecrets[env.id]
                        ? '••••••••••••'
                        : env.value}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {env.encrypted ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Lock className="h-3 w-3" />
                        Encrypted
                      </span>
                    ) : (
                      <span className="text-xs text-[hsl(240_5%_45%)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleVisibility(env.id)}
                        className="p-1.5 rounded-lg hover:bg-[hsl(240_8%_14%)] text-[hsl(240_5%_55%)] hover:text-white transition-colors"
                      >
                        {visibleSecrets[env.id] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(env.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-[hsl(240_5%_55%)] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
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
            <Variable className="h-10 w-10 text-[hsl(240_5%_35%)] mx-auto mb-3" />
            <p className="text-[hsl(240_5%_55%)]">No environment variables</p>
            <p className="text-xs text-[hsl(240_5%_45%)] mt-1">
              Click "Add Variable" to create one
            </p>
          </div>
        )}
      </Card>

      {/* Info */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-[hsl(240_8%_10%)] border border-[hsl(240_6%_18%)]">
        <Lock className="h-4 w-4 text-[hsl(25_95%_53%)] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-white">Encrypted Variables</p>
          <p className="text-xs text-[hsl(240_5%_55%)] mt-1">
            Encrypted values are stored securely using Supabase Vault and are only decrypted at
            runtime. They are masked in logs and the UI by default.
          </p>
        </div>
      </div>
    </div>
  );
}
