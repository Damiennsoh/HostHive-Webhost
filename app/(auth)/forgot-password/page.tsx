'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-lg border border-border bg-card p-8 text-center shadow-xl shadow-black/20"
      >
        <h1 className="text-2xl font-semibold text-foreground">Reset password</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Password reset is not available in this MVP yet. Use your Supabase project
          dashboard to reset a user, or contact support.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </motion.div>
    </div>
  )
}
