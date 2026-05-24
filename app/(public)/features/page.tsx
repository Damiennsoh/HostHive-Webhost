"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Zap,
  Globe,
  Shield,
  GitBranch,
  Upload,
  Container,
  Mail,
  Lock,
  Server,
  Layers,
  RefreshCw,
  MapPin,
} from "lucide-react"
import { APP_NAME } from "@/lib/brand"

const features = [
  {
    icon: Upload,
    title: "Deploy from your computer",
    description:
      "Upload a folder of HTML, CSS, and JavaScript — no GitHub required. Perfect for landing pages, school projects, and client demos.",
    color: "text-primary",
  },
  {
    icon: GitBranch,
    title: "GitHub auto-deploy",
    description:
      "Connect a repository and HostHive rebuilds your app automatically whenever you push code. Works with Node, Python, Go, and more.",
    color: "text-primary",
  },
  {
    icon: Container,
    title: "Docker-powered isolation",
    description:
      "Each project runs in its own container with CPU and memory limits. Your app stays separate from everyone else's — like having a private room in a shared building.",
    color: "text-emerald-400",
  },
  {
    icon: Globe,
    title: "Custom domains & SSL",
    description:
      "Point your domain with simple DNS records (CNAME, A, TXT). We handle HTTPS certificates automatically once DNS is verified.",
    color: "text-blue-400",
  },
  {
    icon: Zap,
    title: "One-click deploy",
    description:
      "No DevOps degree needed. Pick a repo or upload files, click Deploy, and get a live URL in minutes.",
    color: "text-amber-400",
  },
  {
    icon: Mail,
    title: "Deploy notifications",
    description:
      "Get an email when a build succeeds or fails so you always know what's live in production.",
    color: "text-pink-400",
  },
  {
    icon: Lock,
    title: "Secure by default",
    description:
      "Encrypted login, per-user data isolation in the database, and signed webhooks. Secrets are never shown in logs.",
    color: "text-emerald-400",
  },
  {
    icon: Server,
    title: "Built on Coolify + Nixpacks",
    description:
      "We use battle-tested open-source tools to detect your language and build it — you don't maintain servers or build scripts.",
    color: "text-cyan-400",
  },
  {
    icon: Layers,
    title: "Frontends & backends",
    description:
      "Host static sites, React/Vue apps, APIs, and custom Dockerfiles on the same platform.",
    color: "text-purple-400",
  },
  {
    icon: RefreshCw,
    title: "Deployment history",
    description:
      "See every deploy, who triggered it, and roll back when something breaks (coming in production).",
    color: "text-orange-400",
  },
  {
    icon: MapPin,
    title: "Built for Africa & beyond",
    description:
      "Affordable pricing in local currencies, low-bandwidth-friendly dashboards, and infrastructure you can grow without migrating later.",
    color: "text-primary",
  },
  {
    icon: Shield,
    title: "Traefik routing",
    description:
      "Professional reverse proxy handles traffic routing and SSL termination — the same pattern used by major cloud providers.",
    color: "text-green-400",
  },
]

export default function FeaturesPage() {
  return (
    <motion.div className="min-h-screen">
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container relative mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Everything you need to
              <span className="text-primary"> ship faster</span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {APP_NAME} wraps proven deployment tools behind a simple dashboard — so you focus on
              building, not servers.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-border bg-card p-8 transition-colors hover:border-primary/40"
              >
                <div className={`mb-4 inline-flex rounded-xl bg-muted p-3 ${feature.color}`}>
                  <feature.icon className="size-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-24">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">Ready to deploy your first app?</h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Create a free account and go live in minutes — from GitHub or your local files.
          </p>
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-lg font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start for Free
          </Link>
        </div>
      </section>
    </motion.div>
  )
}
