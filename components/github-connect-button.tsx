'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Github, Loader2 } from 'lucide-react';
import { connectGitHubAction } from '@/app/actions/github';
import { useToast } from '@/components/ui/use-toast';

interface GitHubConnectButtonProps {
  isConnected?: boolean;
  className?: string;
}

export function GitHubConnectButton({ isConnected, className }: GitHubConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      setLoading(true);
      await connectGitHubAction();
    } catch (err) {
      console.error('[GitHub Connect Error]', err);
      toast({
        title: 'Connection Failed',
        description: err instanceof Error ? err.message : 'Could not redirect to GitHub',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={loading}
      variant={isConnected ? 'outline' : 'default'}
      className={className}
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Github className="mr-2 h-4 w-4" />
      )}
      {isConnected ? 'Reconnect GitHub' : 'Connect GitHub'}
    </Button>
  );
}
