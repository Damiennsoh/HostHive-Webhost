'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Contains number', test: (p) => /[0-9]/.test(p) },
]

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  const passwordStrength = useMemo(() => {
    const passedRequirements = passwordRequirements.filter((req) =>
      req.test(password)
    ).length
    return passedRequirements
  }, [password])

  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-zinc-700'
    if (passwordStrength === 1) return 'bg-red-500'
    if (passwordStrength === 2) return 'bg-amber-500'
    if (passwordStrength === 3) return 'bg-yellow-500'
    return 'bg-emerald-500'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !username || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (passwordStrength < 4) {
      setError('Please meet all password requirements')
      return
    }

    try {
      await register(email, username, password)
      router.push('/dashboard')
    } catch {
      setError('Registration failed. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-md px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
              <span className="text-lg font-bold text-black">H</span>
            </div>
            <span className="text-xl font-semibold text-foreground">HostHive</span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-border bg-card p-8 shadow-xl shadow-black/20">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold text-foreground">Create your account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Start deploying in minutes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-zinc-600 focus:ring-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-muted border-border text-foreground placeholder:text-muted-foreground focus:border-zinc-600 focus:ring-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-muted border-border pr-10 text-foreground placeholder:text-muted-foreground focus:border-zinc-600 focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors',
                          passwordStrength >= level ? getStrengthColor() : 'bg-zinc-700'
                        )}
                      />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {passwordRequirements.map((req) => (
                      <div
                        key={req.label}
                        className="flex items-center gap-2 text-xs"
                      >
                        {req.test(password) ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <X className="h-3 w-3 text-zinc-500" />
                        )}
                        <span
                          className={
                            req.test(password)
                              ? 'text-muted-foreground'
                              : 'text-zinc-500'
                          }
                        >
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-muted border-border pr-10 text-foreground placeholder:text-muted-foreground focus:border-zinc-600 focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400">Passwords do not match</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black hover:bg-white/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-foreground hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
