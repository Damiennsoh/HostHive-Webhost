import { APP_DOMAIN } from '@/lib/brand';

export interface DnsRecord {
  type: 'A' | 'CNAME' | 'TXT';
  name: string;
  value: string;
  purpose: string;
}

export function getDnsRecordsForDomain(domain: string, projectSlug: string): DnsRecord[] {
  const isApex = !domain.includes('.') || domain.split('.').length === 2;
  const cnameTarget = `${projectSlug}.${APP_DOMAIN}`;

  const records: DnsRecord[] = [
    {
      type: 'CNAME',
      name: domain.startsWith('www.') ? 'www' : domain,
      value: cnameTarget,
      purpose: 'Routes traffic to your LynxHost deployment',
    },
  ];

  if (isApex) {
    records.unshift({
      type: 'A',
      name: '@',
      value: process.env.NEXT_PUBLIC_HOSTING_IP ?? '76.76.21.21',
      purpose: 'Apex domain — use if your registrar does not support CNAME flattening',
    });
  }

  records.push({
    type: 'TXT',
    name: '_hosthive',
    value: `hosthive-verify=${projectSlug}`,
    purpose: 'Proves you own this domain before SSL is issued',
  });

  return records;
}

export function getDefaultPlatformRecords(): DnsRecord[] {
  return [
    {
      type: 'CNAME',
      name: 'www',
      value: `cname.${APP_DOMAIN}`,
      purpose: 'Subdomain routing',
    },
    {
      type: 'A',
      name: '@',
      value: process.env.NEXT_PUBLIC_HOSTING_IP ?? '76.76.21.21',
      purpose: 'Apex domain routing',
    },
  ];
}
