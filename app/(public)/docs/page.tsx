"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BookOpen,
  Rocket,
  Upload,
  Globe,
  Shield,
  GitBranch,
  Settings,
  ChevronDown,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { APP_NAME } from "@/lib/brand"
import { cn } from "@/lib/utils"

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Your first deploy in plain language",
    icon: Rocket,
    links: [
      {
        title: "Create an account",
        href: "/register",
        summary:
          "Sign up with email in under a minute. During beta, mock login works with any credentials so you can explore the dashboard.",
      },
      {
        title: "Deploy a static site from your PC",
        href: "/projects/new",
        summary:
          "On New Project, choose Local files, pick a folder with index.html, and click Deploy. No GitHub account needed.",
      },
      {
        title: "Connect GitHub for auto-deploy",
        href: "/projects/new",
        summary:
          "Choose GitHub as the source, pick a repo, and every push to your branch triggers a new build automatically.",
      },
      {
        title: "Environment variables explained",
        id: "env-vars",
        summary:
          "Secrets like API keys go in Environment Variables — not in your code. They are injected into your container at runtime.",
      },
    ],
  },
  {
    id: "local-files",
    title: "Deploy from local files",
    description: "HTML, CSS, and JS without Git",
    icon: Upload,
    links: [
      {
        title: "Upload a folder or zip",
        href: "/projects/new",
        summary:
          "Use the folder picker in your browser. Include index.html at the root. CSS and JS can live in subfolders.",
      },
      {
        title: "What files are supported",
        id: "static-files",
        summary:
          "Static assets: .html, .css, .js, images, fonts, and JSON. For React/Vue/Next apps, connect GitHub instead.",
      },
      {
        title: "Fixing broken paths & assets",
        id: "static-paths",
        summary:
          "Use relative paths (./style.css not C:\\Users\\...). Open index.html locally first to confirm links work.",
      },
      {
        title: "When to use Git instead",
        id: "git-vs-upload",
        summary:
          "Upload is best for simple sites. Use GitHub when you need builds, npm install, or team collaboration.",
      },
    ],
  },
  {
    id: "github",
    title: "GitHub & webhooks",
    description: "Push code → automatic rebuild",
    icon: GitBranch,
    links: [
      {
        title: "Link your repository",
        href: "/projects/new",
        summary: "Select a repo from the list (demo mode shows sample repos). Set branch to main or your default.",
      },
      {
        title: "How webhooks work",
        id: "webhooks",
        summary:
          "GitHub notifies HostHive on each push. We verify the signature, queue a build, and deploy via Coolify.",
      },
      {
        title: "Branches & preview deploys",
        id: "branches",
        summary:
          "Production uses your main branch. Preview URLs for pull requests are on the Team plan roadmap.",
      },
      {
        title: "Troubleshooting failed builds",
        id: "build-failures",
        summary:
          "Check deploy emails, confirm package.json exists for Node apps, and verify env vars are set.",
      },
    ],
  },
  {
    id: "domains",
    title: "Domains & SSL",
    description: "Use your own domain with HTTPS",
    icon: Shield,
    links: [
      {
        title: "Add a custom domain",
        href: "/domains",
        summary: "Go to Domains → Add Domain, pick a project, and enter your domain (e.g. www.yoursite.com).",
      },
      {
        title: "DNS records (CNAME, A, TXT)",
        id: "dns",
        summary:
          "Copy the CNAME or A record HostHive shows into your registrar (Namecheap, GoDaddy, etc.). TXT verifies ownership.",
      },
      {
        title: "Verify domain ownership",
        id: "domain-verify",
        summary: "After DNS propagates (up to 48h, often minutes), click Verify. SSL is issued automatically.",
      },
      {
        title: "Free SSL certificates",
        id: "ssl",
        summary: "HTTPS is enabled once DNS is verified. Certificates renew automatically — no manual steps.",
      },
    ],
  },
  {
    id: "platform",
    title: "How HostHive works",
    description: "Under the hood — simplified",
    icon: Globe,
    links: [
      {
        title: "Coolify & Docker containers",
        id: "coolify",
        summary:
          "Each app runs in an isolated Docker container. Coolify detects your stack (Node, static, etc.) and builds it.",
      },
      {
        title: "Traefik routing & SSL",
        id: "traefik",
        summary:
          "Traefik routes traffic from your domain to the right container and terminates HTTPS at the edge.",
      },
      {
        title: "Supabase auth & data",
        id: "supabase",
        summary:
          "Login, projects, and domains are stored in Supabase with row-level security so users only see their own data.",
      },
      {
        title: "Email alerts (Resend)",
        id: "notifications",
        summary: "Deploy success and failure emails are sent via Resend so you know when your site is live.",
      },
    ],
  },
  {
    id: "billing",
    title: "Account & billing",
    description: "Plans inspired by Vercel, Render & Railway",
    icon: Settings,
    links: [
      {
        title: "Hobby vs Pro vs Team",
        href: "/pricing",
        summary:
          "Hobby is free forever (like Vercel). Pro is $5/mo with 3 months free (like Render). New users get $5 credit (like Railway).",
      },
      {
        title: "Launch pricing guarantee",
        href: "/pricing#faq",
        summary: "Early adopters keep launch rates for 12 months. We notify you before any price changes.",
      },
      {
        title: "Billing & invoices",
        href: "/settings?tab=billing",
        summary: "View your plan, payment method, and invoices from Settings → Billing (coming at launch).",
      },
      {
        title: "API keys (Team)",
        href: "/api-keys",
        summary: "Team plan includes API access to automate deploys from CI or scripts.",
      },
    ],
  },
]

const popularGuides = [
  {
    id: "guide-static",
    title: "Deploy HTML/CSS/JS from your laptop",
    description: "Step-by-step: zip your site folder, upload, and get a live URL.",
    readTime: "4 min read",
    href: "/projects/new",
    content: [
      "Create a folder with index.html plus your CSS and JS files.",
      "In HostHive, go to Projects → New Project → Local files.",
      "Click Choose folder and select your site directory.",
      "Name the project and click through to Deploy.",
      "Your site will be live at something like my-site.hosthive.app within a minute.",
    ],
  },
  {
    id: "guide-domain",
    title: "Connect a custom domain",
    description: "Copy DNS records from HostHive into your domain registrar.",
    readTime: "5 min read",
    href: "/domains",
    content: [
      "Open Domains in the dashboard and click Add Domain.",
      "Enter your domain and link it to a project.",
      "HostHive shows CNAME, A, and TXT records — copy each into your DNS panel.",
      "Wait for propagation, then click Verify.",
      "HTTPS turns on automatically once verification succeeds.",
    ],
  },
  {
    id: "guide-env",
    title: "Set environment variables",
    description: "Store API keys and secrets safely — never commit them to Git.",
    readTime: "3 min read",
    content: [
      "During project setup (step 3), add KEY=value pairs.",
      "Mark sensitive values as secret so they are hidden in the UI.",
      "Variables are injected when your container starts — not baked into the image.",
      "Change them anytime from the project settings page.",
      "Redeploy after updating vars so the new values take effect.",
    ],
  },
  {
    id: "guide-deploy-flow",
    title: "What happens when you click Deploy?",
    description: "From upload to container to public URL — the full journey.",
    readTime: "6 min read",
    content: [
      "HostHive creates a project record and assigns a subdomain.",
      "Your files or Git repo are sent to Coolify on our server.",
      "Coolify builds a Docker image (or serves static files directly).",
      "Traefik registers the route and provisions SSL.",
      "You get a live URL and an email when the deploy finishes.",
    ],
  },
]

function ExpandableSectionCard({
  section,
  isOpen,
  onToggle,
}: {
  section: (typeof sections)[0]
  isOpen: boolean
  onToggle: () => void
}) {
  const Icon = section.icon
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card transition-all",
        isOpen ? "border-primary/50" : "border-border hover:border-primary/30"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-6 text-left"
        aria-expanded={isOpen}
      >
        <div className="inline-flex rounded-xl bg-primary/10 p-3 text-primary">
          <Icon className="size-6" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-semibold">{section.title}</h3>
            <ChevronDown
              className={cn(
                "size-5 shrink-0 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </div>
          <p className="mt-1 text-muted-foreground">{section.description}</p>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ul className="space-y-4 border-t border-border px-6 pb-6 pt-2">
              {section.links.map((link) => (
                <li key={link.title} className="rounded-lg bg-muted/40 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{link.title}</p>
                    {link.href && (
                      <Link
                        href={link.href}
                        className="inline-flex shrink-0 items-center gap-1 text-xs text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Open
                        <ExternalLink className="size-3" />
                      </Link>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {link.summary}
                  </p>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ExpandableGuideCard({
  guide,
  isOpen,
  onToggle,
}: {
  guide: (typeof popularGuides)[0]
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card transition-all",
        isOpen ? "border-primary/50" : "border-border hover:border-primary/30"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-6 text-left"
        aria-expanded={isOpen}
      >
        <div className="rounded-lg bg-primary/10 p-3">
          <Rocket className="size-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">{guide.title}</h3>
            <ChevronDown
              className={cn(
                "size-5 shrink-0 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{guide.description}</p>
          <span className="mt-2 inline-block text-xs text-muted-foreground">{guide.readTime}</span>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ol className="list-decimal space-y-2 border-t border-border px-6 pb-6 pl-12 pt-4 text-sm leading-relaxed text-muted-foreground">
              {guide.content.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <div className="border-t border-border px-6 pb-6">
              <Link
                href={guide.href}
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Try it now
                <ExternalLink className="size-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DocsPage() {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [openGuide, setOpenGuide] = useState<string | null>(popularGuides[0].id)

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden border-b border-border py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="container relative mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
              <BookOpen className="size-4 text-primary" />
              <span className="text-sm font-medium">Documentation</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              Learn how to build with {APP_NAME}
            </h1>
            <p className="mx-auto mb-4 max-w-2xl text-xl text-muted-foreground">
              Click any topic to expand a short explanation. No DevOps background required.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-6 md:grid-cols-2">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.03 }}
              >
                <ExpandableSectionCard
                  section={section}
                  isOpen={openSection === section.id}
                  onToggle={() =>
                    setOpenSection((prev) => (prev === section.id ? null : section.id))
                  }
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-24">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Popular guides</h2>
            <p className="text-muted-foreground">
              Click a guide to see the steps — then try it in the dashboard
            </p>
          </div>
          <div className="space-y-4">
            {popularGuides.map((guide, index) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <ExpandableGuideCard
                  guide={guide}
                  isOpen={openGuide === guide.id}
                  onToggle={() =>
                    setOpenGuide((prev) => (prev === guide.id ? null : guide.id))
                  }
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
