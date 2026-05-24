function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function mapProjectTypeToRuntime(
  projectType: string
): 'nixpacks' | 'dockerfile' | 'static' {
  if (projectType === 'docker') return 'dockerfile';
  if (projectType === 'static') return 'static';
  return 'nixpacks';
}

export { slugify };
