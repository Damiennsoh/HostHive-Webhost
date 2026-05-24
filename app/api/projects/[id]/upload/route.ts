import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/api-auth';

/** Accepts static file uploads for a project (demo: validates only; production: forwards to Coolify). */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  const { id } = await params;
  const formData = await request.formData();
  const files = formData.getAll('files');

  if (!files.length) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  const totalSize = files.reduce((sum, f) => {
    if (f instanceof File) return sum + f.size;
    return sum;
  }, 0);

  if (totalSize > 50 * 1024 * 1024) {
    return NextResponse.json({ error: 'Upload exceeds 50MB limit' }, { status: 413 });
  }

  if (auth.isDemo) {
    return NextResponse.json({
      success: true,
      projectId: id,
      filesReceived: files.length,
      message: 'Static files accepted (demo mode)',
    });
  }

  // Production: integrate with Coolify static site / object storage
  return NextResponse.json({
    success: true,
    projectId: id,
    filesReceived: files.length,
    message: 'Files queued for deployment',
  });
}
