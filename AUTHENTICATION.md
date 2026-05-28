# Lynx Host Authentication Guide

Complete authentication implementation for Lynx Host with support for email/password, GitHub OAuth, and session management.

## Authentication Flow

```
User → Dashboard
  ↓
Login Form
  ↓
POST /api/auth/login
  ↓
Validate Credentials (DB or OAuth)
  ↓
Generate JWT Token
  ↓
Return Token + User Data
  ↓
Store Token (localStorage/cookies)
  ↓
Include in API Headers
  ↓
Access Protected Routes
```

## Implementation

### 1. Email/Password Authentication

#### Login API Route

Already implemented in `/app/api/auth/login/route.ts`:

```typescript
POST /api/auth/login
Body: {
  email: string,
  password: string
}

Response (200): {
  success: true,
  user: { id, email, name, avatar_url },
  token: "JWT_TOKEN",
  expiresAt: "ISO8601_TIMESTAMP"
}

Error (401): {
  error: "Invalid email or password"
}
```

#### Register API Route

Already implemented in `/app/api/auth/register/route.ts`:

```typescript
POST /api/auth/register
Body: {
  email: string,
  password: string,
  name: string
}

Response (201): {
  success: true,
  user: { id, email, name, avatar_url },
  token: "JWT_TOKEN",
  expiresAt: "ISO8601_TIMESTAMP"
}

Error (400): {
  error: "Password must be at least 8 characters"
}
```

### 2. Password Hashing (Production)

For production, use bcrypt:

```typescript
import bcrypt from 'bcrypt';

// Hash password on registration
const passwordHash = await bcrypt.hash(password, 12);

// Verify password on login
const isValid = await bcrypt.compare(password, storedHash);
```

### 3. JWT Token Management

#### Token Structure

```typescript
{
  iss: 'lynxhost',
  sub: 'user_id',
  email: 'user@example.com',
  iat: 1621857600,
  exp: 1621944000,
  aud: 'lynxhost-app'
}
```

#### Token Verification Middleware

```typescript
// lib/verify-token.ts

import jwt from 'jsonwebtoken';

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Usage in API routes
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const user = await verifyToken(token);
    // Continue with authenticated request
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
```

### 4. Authentication Context

Already implemented in `/lib/auth-context.tsx`:

```typescript
'use client'

import { useAuth } from '@/lib/auth-context';

export function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 5. Protected Routes

#### Server-Side Protection

```typescript
// app/(dashboard)/layout.tsx

export default function DashboardLayout({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    redirect('/login');
  }
  
  return <div>{children}</div>;
}
```

#### Client-Side Protection

```typescript
'use client'

import { useAuth } from '@/lib/auth-context';
import { redirect } from 'next/navigation';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) redirect('/login');
  
  return <div>Protected content</div>;
}
```

## OAuth Integration

### GitHub OAuth

#### 1. Register GitHub App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App:
   - **Application name**: Lynx Host
   - **Homepage URL**: https://your-domain.com
   - **Authorization callback URL**: https://your-domain.com/api/auth/github/callback
3. Copy **Client ID** and **Client Secret**
4. Add to `.env.local`:

```bash
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

#### 2. GitHub Login Endpoint

```typescript
// app/api/auth/github/route.ts

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`;
  
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.append('client_id', clientId);
  githubAuthUrl.searchParams.append('redirect_uri', redirectUri);
  githubAuthUrl.searchParams.append('scope', 'user:email');
  
  return NextResponse.redirect(githubAuthUrl);
}
```

#### 3. GitHub Callback

```typescript
// app/api/auth/github/callback/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  
  if (!code) {
    return NextResponse.json(
      { error: 'Missing authorization code' },
      { status: 400 }
    );
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    
    const { access_token } = await tokenResponse.json();
    
    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });
    
    const githubUser = await userResponse.json();
    
    // TODO: Create or update user in database
    // TODO: Generate JWT token
    // TODO: Redirect to dashboard with token
    
    return NextResponse.redirect(
      `/dashboard?token=${jwtToken}&email=${githubUser.email}`
    );
  } catch (error) {
    console.error('GitHub auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
```

### Google OAuth

Similar implementation to GitHub but using Google OAuth endpoints:

```bash
# .env.local
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Endpoints
# Authorize: https://accounts.google.com/o/oauth2/v2/auth
# Token: https://oauth2.googleapis.com/token
# User: https://openidconnect.googleapis.com/v1/userinfo
```

## Session Management

### Secure Cookie Storage

```typescript
// lib/auth-utils.ts

import { cookies } from 'next/headers';

export async function setAuthCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  
  cookieStore.set('auth-token', token, {
    httpOnly: true,        // Prevents XSS
    secure: true,          // HTTPS only
    sameSite: 'strict',    // CSRF protection
    expires: expiresAt,
  });
}

export async function getAuthCookie() {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}
```

### Logout

```typescript
// app/api/auth/logout/route.ts

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');
    
    return NextResponse.json(
      { success: true, message: 'Logged out' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
```

## Email Verification (Optional)

```typescript
// Send verification email on registration

import { sendVerificationEmail } from '@/lib/email';

const verificationToken = generateToken();

// Store token in database with expiry
await saveVerificationToken(user.id, verificationToken);

// Send email
await sendVerificationEmail(user.email, verificationToken);

// Verification endpoint
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  
  // Verify token
  const isValid = await verifyToken(token);
  
  if (isValid) {
    // Mark user as verified
    // Redirect to login
  }
}
```

## Password Reset

```typescript
// Send reset email
async function requestPasswordReset(email: string) {
  const user = await findUserByEmail(email);
  
  if (!user) {
    return { error: 'User not found' }; // Don't reveal if user exists
  }
  
  const resetToken = generateSecureToken();
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
  
  // Store token
  await savePasswordResetToken(user.id, resetToken, expiresAt);
  
  // Send email
  await sendPasswordResetEmail(user.email, resetToken);
}

// Reset password endpoint
export async function POST(request: NextRequest) {
  const { token, newPassword } = await request.json();
  
  // Verify token
  const resetRecord = await getPasswordResetToken(token);
  
  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 400 }
    );
  }
  
  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 12);
  
  // Update password
  await updateUserPassword(resetRecord.userId, passwordHash);
  
  // Delete reset token
  await deletePasswordResetToken(token);
  
  return NextResponse.json({ success: true });
}
```

## Two-Factor Authentication (2FA) - Future

```typescript
// Generate 2FA secret on account setup
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const secret = speakeasy.generateSecret({
  name: `Lynx Host (${user.email})`,
  length: 32,
});

// Generate QR code
const qrCode = await QRCode.toDataURL(secret.otpauth_url);

// Verify 2FA token
function verify2FA(secret: string, token: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });
}
```

## Security Best Practices

### ✅ Do

- Use HTTPS for all authentication
- Hash passwords with bcrypt/argon2
- Store tokens in httpOnly cookies
- Implement rate limiting on login attempts
- Use CSRF tokens for form submissions
- Validate all inputs server-side
- Log authentication events
- Rotate tokens periodically
- Implement 2FA for sensitive accounts

### ❌ Don't

- Store passwords in plain text
- Use weak hashing algorithms
- Store tokens in localStorage (XSS vulnerability)
- Transmit tokens in URLs
- Log sensitive data
- Hardcode secrets in code
- Skip email verification
- Allow weak passwords
- Use JWT without signing

## Testing

### Test User Accounts

```bash
# Development
Email: dev@lynxhost.app
Password: password123

# Test accounts
Email: test@example.com
Password: test123456

Email: user@lynxhost.app
Password: user123456
```

### Test Flow

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@lynxhost.app","password":"password123"}'

# Response:
{
  "success": true,
  "user": { ... },
  "token": "eyJhbGc...",
  "expiresAt": "2024-05-31T10:30:00Z"
}

# 2. Use token
curl http://localhost:3000/api/projects \
  -H "Authorization: Bearer eyJhbGc..."

# 3. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGc..."
```

## Troubleshooting

### Token Validation Failed

```bash
# Check token expiry
# Verify JWT_SECRET matches in .env

# Check token format
Authorization: Bearer <token>  # Correct
Authorization: <token>        # Incorrect
```

### Session Lost on Refresh

```bash
# Implement token refresh endpoint
POST /api/auth/refresh
# Return new token if current still valid

# Store token in secure cookie
httpOnly: true
secure: true  # HTTPS only
```

### GitHub OAuth Issues

```bash
# Verify callback URL matches exactly
# Check Client ID and Secret are correct
# Ensure scope permissions are requested
# Check email is public or request email scope
```

## Next Steps

1. Implement bcrypt password hashing
2. Add Supabase auth integration
3. Implement GitHub OAuth
4. Setup email verification
5. Add password reset flow
6. Implement 2FA
7. Add rate limiting
8. Setup audit logging

## Resources

- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [GitHub OAuth Docs](https://docs.github.com/en/developers/apps/building-oauth-apps)

