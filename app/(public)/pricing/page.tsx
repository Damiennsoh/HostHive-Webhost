"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Hobby",
    description: "Perfect for personal projects and experiments",
    price: "Free",
    priceDetail: "forever",
    features: [
      { name: "Unlimited deployments", included: true },
      { name: "100GB bandwidth/month", included: true },
      { name: "SSL certificates", included: true },
      { name: "Preview deployments", included: true },
      { name: "Community support", included: true },
      { name: "Custom domains", included: false },
      { name: "Team collaboration", included: false },
      { name: "Analytics", included: false },
      { name: "Priority support", included: false },
    ],
    cta: "Get Started",
    href: "/register",
    highlighted: false
  },
  {
    name: "Pro",
    description: "For professional developers and small teams",
    price: "$20",
    priceDetail: "per user/month",
    features: [
      { name: "Unlimited deployments", included: true },
      { name: "1TB bandwidth/month", included: true },
      { name: "SSL certificates", included: true },
      { name: "Preview deployments", included: true },
      { name: "Email support", included: true },
      { name: "Custom domains", included: true },
      { name: "Team collaboration (5 members)", included: true },
      { name: "Basic analytics", included: true },
      { name: "Priority support", included: false },
    ],
    cta: "Start Free Trial",
    href: "/register?plan=pro",
    highlighted: true
  },
  {
    name: "Enterprise",
    description: "For organizations with advanced needs",
    price: "Custom",
    priceDetail: "contact sales",
    features: [
      { name: "Unlimited deployments", included: true },
      { name: "Unlimited bandwidth", included: true },
      { name: "SSL certificates", included: true },
      { name: "Preview deployments", included: true },
      { name: "24/7 dedicated support", included: true },
      { name: "Custom domains", included: true },
      { name: "Unlimited team members", included: true },
      { name: "Advanced analytics", included: true },
      { name: "SLA guarantee", included: true },
    ],
    cta: "Contact Sales",
    href: "/contact",
    highlighted: false
  }
]

const faqs = [
  {
    question: "Can I change plans later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated."
  },
  {
    question: "What happens if I exceed my bandwidth limit?",
    answer: "We will notify you when you reach 80% of your limit. You can upgrade your plan or purchase additional bandwidth as needed."
  },
  {
    question: "Do you offer discounts for startups?",
    answer: "Yes! We offer a 50% discount for the first year to qualifying startups. Contact our sales team to learn more."
  },
  {
    question: "Is there a free trial for Pro?",
    answer: "Yes, Pro comes with a 14-day free trial. No credit card required to start."
  }
]

export default function PricingPage() {
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
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Start for free, scale as you grow. No hidden fees, no surprises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl border ${
                  plan.highlighted 
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10" 
                    : "border-border bg-card"
                } p-8`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground text-sm font-medium px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground ml-2">{plan.priceDetail}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="size-5 text-primary shrink-0" />
                      ) : (
                        <X className="size-5 text-muted-foreground/50 shrink-0" />
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
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto max-w-3xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground">
              {"Can't find what you're looking for? "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact our team
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
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
