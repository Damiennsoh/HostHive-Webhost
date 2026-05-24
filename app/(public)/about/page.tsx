"use client"

import { motion } from "framer-motion"
import { Target, Heart, Rocket, Users } from "lucide-react"

const stats = [
  { label: "Developers", value: "100K+" },
  { label: "Deployments/day", value: "2M+" },
  { label: "Uptime", value: "99.99%" },
  { label: "Edge Locations", value: "300+" }
]

const values = [
  {
    icon: Target,
    title: "Developer First",
    description: "We build tools that developers love to use. Every feature is designed with the developer experience in mind."
  },
  {
    icon: Rocket,
    title: "Speed Matters",
    description: "From build times to page loads, we obsess over performance. Your users deserve the fastest experience possible."
  },
  {
    icon: Heart,
    title: "Open Source",
    description: "We believe in open source and actively contribute to the ecosystem. Many of our tools are open source."
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Our roadmap is shaped by our community. We listen, learn, and build based on real developer feedback."
  }
]

const team = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-founder",
    bio: "Former engineering lead at AWS. Passionate about making cloud infrastructure accessible.",
    avatar: "SC"
  },
  {
    name: "Marcus Johnson",
    role: "CTO & Co-founder",
    bio: "Previously at Google Cloud. Expert in distributed systems and edge computing.",
    avatar: "MJ"
  },
  {
    name: "Emily Rodriguez",
    role: "VP of Engineering",
    bio: "Led platform teams at Stripe. Focused on developer experience and reliability.",
    avatar: "ER"
  },
  {
    name: "David Kim",
    role: "VP of Product",
    bio: "Product leader from Vercel. Obsessed with simplifying complex workflows.",
    avatar: "DK"
  }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto max-w-4xl px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-balance mb-6">
              Building the future of
              <span className="text-primary"> web deployment</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              {"We're on a mission to make deploying and scaling web applications as simple as a single command. Founded in 2020, we've grown to serve over 100,000 developers worldwide."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24">
        <div className="container mx-auto max-w-4xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg prose-invert mx-auto">
              <p className="text-muted-foreground leading-relaxed mb-6">
                NimbusCloud was born out of frustration. As developers, we spent countless hours wrestling with deployment pipelines, configuring servers, and debugging infrastructure issues instead of building products.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We asked ourselves: why is deploying a web application still so complicated in 2020? Why do developers need to become DevOps experts just to ship their code?
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                So we built NimbusCloud - a platform that handles all the complexity of modern web deployment, so you can focus on what matters: building great products for your users.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {"Today, we're proud to serve over 100,000 developers and businesses worldwide, from solo indie hackers to Fortune 500 companies. And we're just getting started."}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-6 rounded-2xl border border-border bg-card p-8"
              >
                <div className="shrink-0">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <value.icon className="size-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet the Team</h2>
            <p className="text-xl text-muted-foreground">
              The people behind NimbusCloud
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="mb-4 mx-auto size-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {member.avatar}
                </div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-primary text-sm mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join our team
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {"We're always looking for talented people who share our vision. Check out our open positions."}
            </p>
            <a
              href="/careers"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-8 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View Open Positions
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
