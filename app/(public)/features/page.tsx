"use client"

import { motion } from "framer-motion"
import { 
  Zap, 
  Globe, 
  Shield, 
  BarChart3, 
  GitBranch, 
  Layers,
  Terminal,
  Lock,
  Cpu,
  Database,
  Cloud,
  RefreshCw
} from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Edge Runtime",
    description: "Deploy to 300+ edge locations worldwide. Your code runs close to your users, ensuring sub-50ms response times globally.",
    color: "text-yellow-500"
  },
  {
    icon: Globe,
    title: "Global CDN",
    description: "Automatic asset optimization and distribution across our global content delivery network with intelligent caching.",
    color: "text-blue-500"
  },
  {
    icon: Shield,
    title: "DDoS Protection",
    description: "Enterprise-grade DDoS mitigation with automatic threat detection and real-time blocking of malicious traffic.",
    color: "text-green-500"
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Monitor performance, errors, and user behavior with detailed analytics dashboards and custom alerts.",
    color: "text-purple-500"
  },
  {
    icon: GitBranch,
    title: "Git Integration",
    description: "Connect your GitHub, GitLab, or Bitbucket repositories. Every push triggers automatic deployments.",
    color: "text-orange-500"
  },
  {
    icon: Layers,
    title: "Preview Deployments",
    description: "Every pull request gets its own preview URL. Share and test changes before merging to production.",
    color: "text-pink-500"
  },
  {
    icon: Terminal,
    title: "Serverless Functions",
    description: "Deploy backend logic without managing servers. Auto-scaling functions that handle any traffic load.",
    color: "text-cyan-500"
  },
  {
    icon: Lock,
    title: "SSL/TLS Certificates",
    description: "Free automatic SSL certificates for all your domains with automatic renewal and configuration.",
    color: "text-emerald-500"
  },
  {
    icon: Cpu,
    title: "Build Optimization",
    description: "Smart build caching and parallel execution reduce build times by up to 70% compared to traditional CI/CD.",
    color: "text-red-500"
  },
  {
    icon: Database,
    title: "Edge Storage",
    description: "Low-latency key-value storage at the edge. Perfect for session data, feature flags, and user preferences.",
    color: "text-indigo-500"
  },
  {
    icon: Cloud,
    title: "Multi-Region Failover",
    description: "Automatic failover between regions ensures 99.99% uptime even during major infrastructure incidents.",
    color: "text-teal-500"
  },
  {
    icon: RefreshCw,
    title: "Instant Rollbacks",
    description: "One-click rollbacks to any previous deployment. Never worry about breaking changes in production.",
    color: "text-amber-500"
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto max-w-6xl px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance mb-6">
              Everything you need to
              <span className="text-primary"> ship faster</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              A complete platform with all the tools and infrastructure you need to build, deploy, and scale modern web applications.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className={`mb-4 inline-flex rounded-xl bg-muted p-3 ${feature.color}`}>
                  <feature.icon className="size-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to experience the difference?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of teams shipping faster with NimbusCloud.
            </p>
            <a
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start for Free
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
