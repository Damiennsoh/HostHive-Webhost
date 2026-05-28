"use client"

import { motion } from "framer-motion"
import { Check, X, Sparkles } from "lucide-react"
import Link from "next/link"
import { APP_NAME } from "@/lib/brand"

const promos = [
  {
    label: "Vercel-style",
    title: "Generous free tier",
    detail: "Deploy hobby projects for $0 — no credit card, no time limit.",
  },
  {
    label: "Render-style",
    title: "3 months free on Pro",
    detail: "Upgrade to Pro and pay nothing for your first 3 months (beta offer).",
  },
  {
    label: "Railway-style",
    title: "$5 welcome credit",
    detail: "New accounts get $5 in platform credit during your first month.",
  },
]

const plans = [
  {
    name: "Hobby",
    description: "For personal sites, learning, and side projects — like Vercel Hobby",
    price: "$0",
    priceDetail: "forever",
    badge: null as string | null,
    features: [
      { name: "Unlimited deployments", included: true },
      { name: "3 active projects", included: true },
      { name: "Static upload + GitHub deploy", included: true },
      { name: "100 GB bandwidth / month", included: true },
      { name: "Free SSL on *.lynxhost.app", included: true },
      { name: "Preview deployments", included: true },
      { name: "Community support", included: true },
      { name: "Custom domains", included: false },
      { name: "Team members", included: false },
    ],
    cta: "Start for Free",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For indie hackers and startups ready to go live — best value",
    price: "$5",
    priceDetail: "per month after trial",
    badge: "3 months free",
    features: [
      { name: "Unlimited projects", included: true },
      { name: "Everything in Hobby", included: true },
      { name: "Custom domains + free SSL", included: true },
      { name: "500 GB bandwidth / month", included: true },
      { name: "Email deploy notifications", included: true },
      { name: "Environment variables", included: true },
      { name: "$5 welcome credit (1st month)", included: true },
      { name: "3 team members", included: true },
      { name: "Priority support", included: false },
    ],
    cta: "Claim 3 Months Free",
    href: "/register?plan=pro",
    highlighted: true,
  },
  {
    name: "Team",
    description: "For agencies and growing teams shipping multiple products",
    price: "$15",
    priceDetail: "per month",
    badge: null as string | null,
    features: [
      { name: "Unlimited everything", included: true },
      { name: "Everything in Pro", included: true },
      { name: "1 TB bandwidth / month", included: true },
      { name: "10 team members", included: true },
      { name: "Usage analytics", included: true },
      { name: "Priority email support", included: true },
      { name: "API access", included: true },
      { name: "Shared environment groups", included: true },
      { name: "SLA guarantee", included: false },
    ],
    cta: "Start Team Trial",
    href: "/register?plan=team",
    highlighted: false,
  },
]

const faqs = [
  {
    question: "How does this compare to Vercel, Render, and Railway?",
    answer:
      "We follow the same playbook: a generous free Hobby tier (like Vercel), 3 months free when you upgrade to Pro (like Render’s intro offers), and a $5 welcome credit for new accounts (like Railway’s trial). Prices are lower while we grow — we’ll adjust as usage scales.",
  },
  {
    question: "Do I need a credit card to start?",
    answer:
      "No. Hobby is free forever with no card required. Pro and Team trials also work without a card during beta.",
  },
  {
    question: "Can I deploy without GitHub?",
    answer:
      "Yes. Upload HTML, CSS, and JS from your computer on any plan — no repository needed.",
  },
  {
    question: "What happens after the 3 months free on Pro?",
    answer:
      "Pro becomes $5/month. We email you before billing starts. Downgrade to Hobby anytime — your projects stay, paid features pause.",
  },
  {
    question: "Will prices go up later?",
    answer:
      "Early adopters keep their launch pricing for 12 months. We’ll give plenty of notice before any changes.",
  },
]

export default function PricingPage() {
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
              Simple pricing, startup-friendly
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              {APP_NAME} uses the same playbook as Vercel, Render, and Railway — generous free tier,
              intro credits, and room to grow. Launch pricing stays low while we build our community.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-4 md:grid-cols-3">
            {promos.map((promo, i) => (
              <motion.div
                key={promo.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-md border border-primary/20 bg-primary/5 p-5"
              >
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  <Sparkles className="size-3" />
                  {promo.label}
                </span>
                <p className="mt-3 font-semibold text-foreground">{promo.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{promo.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-md border p-8 ${
                  plan.highlighted
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="rounded-md bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                      Best for startups
                    </span>
                  </div>
                )}
                {plan.badge && !plan.highlighted && (
                  <span className="mb-3 inline-block rounded-md bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="ml-2 text-muted-foreground">{plan.priceDetail}</span>
                  {plan.badge && plan.highlighted && (
                    <p className="mt-2 text-sm font-medium text-emerald-400">{plan.badge}</p>
                  )}
                </div>
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="size-5 shrink-0 text-primary" />
                      ) : (
                        <X className="size-5 shrink-0 text-muted-foreground/50" />
                      )}
                      <span className={feature.included ? "" : "text-muted-foreground/50"}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`flex h-12 w-full items-center justify-center rounded-lg font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted text-foreground hover:bg-muted/80"
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Need dedicated infrastructure, SLA, or invoice billing?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact us for Enterprise
            </Link>
          </p>
        </div>
      </section>

      <section id="faq" className="border-t border-border py-24">
        <div className="container mx-auto max-w-3xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Frequently asked questions</h2>
            <p className="text-muted-foreground">
              Questions?{" "}
              <Link href="/contact" className="text-primary hover:underline">
                Reach out
              </Link>
            </p>
          </motion.div>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h3 className="mb-2 text-lg font-semibold">{faq.question}</h3>
                <p className="leading-relaxed text-muted-foreground">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  )
}

