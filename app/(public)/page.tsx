'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Rocket, 
  Shield, 
  Zap, 
  Globe, 
  GitBranch, 
  Terminal,
  Users,
  Server,
  Lock,
  Activity,
  Check,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

const features = [
  {
    icon: Rocket,
    title: 'Instant Deployments',
    description: 'Deploy your applications in seconds with our global edge network.',
  },
  {
    icon: GitBranch,
    title: 'Git Integration',
    description: 'Automatic deployments from GitHub, GitLab, and Bitbucket.',
  },
  {
    icon: Globe,
    title: 'Global Edge Network',
    description: 'Serve your content from 100+ locations worldwide.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'SOC 2 compliant with advanced DDoS protection.',
  },
  {
    icon: Zap,
    title: 'Auto Scaling',
    description: 'Scale automatically from zero to millions of requests.',
  },
  {
    icon: Terminal,
    title: 'Developer Experience',
    description: 'CLI tools, API access, and seamless local development.',
  },
]

const pricingPlans = [
  {
    name: 'Hobby',
    price: '$0',
    period: '/month',
    description: 'Perfect for personal projects',
    features: [
      '100 GB bandwidth',
      '100 build minutes',
      'Automatic HTTPS',
      'Community support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$20',
    period: '/month',
    description: 'For professional developers',
    features: [
      '1 TB bandwidth',
      '1,000 build minutes',
      'Preview deployments',
      'Team collaboration',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: [
      'Unlimited bandwidth',
      'Unlimited build minutes',
      'SLA guarantees',
      'Dedicated support',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

const stats = [
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '100+', label: 'Edge Locations' },
  { value: '<50ms', label: 'Global Latency' },
  { value: '10M+', label: 'Deployments' },
]

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[1200px] rounded-full bg-white/[0.03] blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm">
              <span className="text-muted-foreground">Announcing LynxHost MVP</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Deploy at the
              <br />
              <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                speed of light
              </span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              LynxHost is a modern hosting platform for frontends, backends, and Docker apps.
              Connect GitHub, deploy with Coolify, and ship in minutes.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href={isAuthenticated ? '/dashboard' : '/register'}>
                <Button size="lg" className="bg-white text-black hover:bg-white/90 h-12 px-8 text-base">
                  {isAuthenticated ? 'Open Dashboard' : 'Start Deploying'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base border-border text-foreground hover:bg-muted">
                  View Documentation
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Terminal preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-16 max-w-4xl"
          >
            <div className="rounded-lg border border-border bg-card overflow-hidden shadow-2xl shadow-black/50">
              <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-zinc-600" />
                <div className="h-3 w-3 rounded-full bg-zinc-600" />
                <div className="h-3 w-3 rounded-full bg-zinc-600" />
                <span className="ml-4 text-sm text-muted-foreground">terminal</span>
              </div>
              <div className="p-6 font-mono text-sm">
                <div className="text-muted-foreground">$ npx hosthive deploy</div>
                <div className="mt-2 text-emerald-400">Deploying to production...</div>
                <div className="mt-1 text-muted-foreground">Building application...</div>
                <div className="mt-1 text-muted-foreground">Optimizing assets...</div>
                <div className="mt-1 text-emerald-400">Deployed to https://app.hosthive.app</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <span className="animate-pulse">_</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-foreground sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to deploy
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A complete platform for building and deploying modern web applications.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group rounded-lg border border-border bg-card p-6 transition-all hover:border-zinc-700 hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <feature.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="border-y border-border bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Streamlined deployment workflow
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From code push to production in minutes. Our platform handles
                the complexity so you can focus on building.
              </p>

              <div className="mt-8 space-y-6">
                {[
                  {
                    icon: GitBranch,
                    title: 'Push your code',
                    description: 'Connect your repository and push to deploy.',
                  },
                  {
                    icon: Server,
                    title: 'Automatic builds',
                    description: 'We detect your framework and build automatically.',
                  },
                  {
                    icon: Globe,
                    title: 'Global distribution',
                    description: 'Your app is served from the nearest edge location.',
                  },
                ].map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex gap-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <step.icon className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-full rounded-lg border border-border bg-card p-6">
                <div className="space-y-4">
                  {[
                    { label: 'Build', status: 'complete', time: '23s' },
                    { label: 'Deploy', status: 'complete', time: '12s' },
                    { label: 'Assign Domain', status: 'complete', time: '2s' },
                    { label: 'Enable SSL', status: 'complete', time: '1s' },
                  ].map((step, index) => (
                    <motion.div
                      key={step.label}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.15 }}
                      viewport={{ once: true }}
                      className="flex items-center justify-between rounded-md bg-muted/50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {step.label}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{step.time}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Total deployment time: <span className="font-medium text-foreground">38s</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Enterprise-grade security
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Your applications are protected by industry-leading security measures.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2">
            {[
              {
                icon: Lock,
                title: 'SSL/TLS Encryption',
                description: 'Automatic HTTPS for all deployments with managed certificates.',
              },
              {
                icon: Shield,
                title: 'DDoS Protection',
                description: 'Advanced threat detection and mitigation at the edge.',
              },
              {
                icon: Users,
                title: 'Access Controls',
                description: 'Fine-grained permissions and role-based access management.',
              },
              {
                icon: Activity,
                title: 'Audit Logging',
                description: 'Complete visibility into all account and deployment activity.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-4"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <item.icon className="h-6 w-6 text-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="border-y border-border bg-muted/30 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that fits your needs. No hidden fees.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-lg border ${
                  plan.highlighted
                    ? 'border-white bg-card'
                    : 'border-border bg-card'
                } p-8`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-medium text-black">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="ml-1 text-muted-foreground">{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={isAuthenticated ? '/dashboard' : '/register'} className="mt-8 block">
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? 'bg-white text-black hover:bg-white/90'
                        : 'bg-muted text-foreground hover:bg-zinc-700'
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-muted/50 px-6 py-16 sm:px-12 sm:py-24">
            <div className="absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-white/[0.02] blur-3xl" />
            </div>

            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Ready to deploy?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join thousands of developers shipping faster with LynxHost.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href={isAuthenticated ? '/dashboard' : '/register'}>
                  <Button size="lg" className="bg-white text-black hover:bg-white/90 h-12 px-8">
                    {isAuthenticated ? 'Open Dashboard' : 'Get Started for Free'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg" className="h-12 px-8 border-border text-foreground hover:bg-muted">
                    Talk to Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
