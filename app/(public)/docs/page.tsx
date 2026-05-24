"use client"

import { motion } from "framer-motion"
import { 
  BookOpen, 
  Rocket, 
  Code2, 
  Settings, 
  Terminal,
  Globe,
  Database,
  Shield,
  ArrowRight
} from "lucide-react"
import Link from "next/link"

const sections = [
  {
    title: "Getting Started",
    description: "Learn the basics and deploy your first project",
    icon: Rocket,
    links: [
      { title: "Quick Start Guide", href: "#" },
      { title: "Creating Your First Project", href: "#" },
      { title: "Connecting Git Repositories", href: "#" },
      { title: "Environment Variables", href: "#" },
    ]
  },
  {
    title: "Frameworks",
    description: "Framework-specific guides and best practices",
    icon: Code2,
    links: [
      { title: "Next.js", href: "#" },
      { title: "React", href: "#" },
      { title: "Vue.js", href: "#" },
      { title: "Nuxt", href: "#" },
    ]
  },
  {
    title: "Deployments",
    description: "Learn about deployment workflows and settings",
    icon: Globe,
    links: [
      { title: "Production Deployments", href: "#" },
      { title: "Preview Deployments", href: "#" },
      { title: "Rollbacks", href: "#" },
      { title: "Build Configuration", href: "#" },
    ]
  },
  {
    title: "Domains & SSL",
    description: "Configure custom domains and certificates",
    icon: Shield,
    links: [
      { title: "Adding Custom Domains", href: "#" },
      { title: "DNS Configuration", href: "#" },
      { title: "SSL Certificates", href: "#" },
      { title: "Redirects", href: "#" },
    ]
  },
  {
    title: "Serverless Functions",
    description: "Build and deploy serverless API routes",
    icon: Terminal,
    links: [
      { title: "Creating Functions", href: "#" },
      { title: "API Routes", href: "#" },
      { title: "Edge Functions", href: "#" },
      { title: "Middleware", href: "#" },
    ]
  },
  {
    title: "Storage & Databases",
    description: "Integrate databases and storage solutions",
    icon: Database,
    links: [
      { title: "Edge Storage", href: "#" },
      { title: "PostgreSQL", href: "#" },
      { title: "Blob Storage", href: "#" },
      { title: "Redis", href: "#" },
    ]
  },
]

const popularGuides = [
  {
    title: "Deploy a Next.js App",
    description: "Step-by-step guide to deploying your Next.js application",
    readTime: "5 min read"
  },
  {
    title: "Configure Environment Variables",
    description: "Learn how to securely manage environment variables",
    readTime: "3 min read"
  },
  {
    title: "Set Up a Custom Domain",
    description: "Connect your own domain to your NimbusCloud project",
    readTime: "4 min read"
  },
  {
    title: "Enable Analytics",
    description: "Track visitor metrics and performance data",
    readTime: "3 min read"
  }
]

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto max-w-6xl px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2">
              <BookOpen className="size-4 text-primary" />
              <span className="text-sm font-medium">Documentation</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance mb-6">
              Learn how to build with NimbusCloud
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty mb-8">
              Comprehensive guides, API references, and examples to help you ship faster.
            </p>
            
            {/* Search */}
            <div className="max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search documentation..."
                  className="w-full h-14 rounded-xl border border-border bg-card px-6 pr-12 text-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 rounded bg-muted text-muted-foreground text-sm font-mono">
                  ⌘K
                </kbd>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/50"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                  <section.icon className="size-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                <p className="text-muted-foreground mb-4">{section.description}</p>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.title}>
                      <Link 
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group/link"
                      >
                        <ArrowRight className="size-3 opacity-0 -ml-5 group-hover/link:opacity-100 group-hover/link:ml-0 transition-all" />
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Guides</h2>
            <p className="text-muted-foreground">
              The most frequently visited documentation pages
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {popularGuides.map((guide, index) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link 
                  href="#"
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 group"
                >
                  <div className="rounded-lg bg-muted p-3">
                    <Settings className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                      {guide.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">{guide.description}</p>
                    <span className="text-xs text-muted-foreground">{guide.readTime}</span>
                  </div>
                  <ArrowRight className="size-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
