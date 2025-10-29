"use client"

import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ThreePreview } from "@/components/three-preview"

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            {/* Logo */}
            <div className="mb-8">
              <h1 className="text-7xl sm:text-8xl font-bold tracking-tighter mb-4">
                trapo<span className="text-accent">.</span>
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-xl sm:text-2xl text-muted-foreground mb-8 max-w-2xl">
              Design your fit. Own your vibe.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Link
                href="/design"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                Start Designing
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/shop"
                className="px-8 py-3 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors"
              >
                Explore Collection
              </Link>
            </div>

            {/* 3D Hoodie Preview */}
            <div className="mb-12">
              <ThreePreview />
              <p className="text-center text-muted-foreground mt-3 text-sm">
                Streetwear in motion — rendered live in 3D
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Unlimited Customization",
                description:
                  "Design with stickers, colors, and placements that express your unique style.",
              },
              {
                title: "Premium Quality",
                description:
                  "Crafted with sustainable materials and meticulous attention to detail.",
              },
              {
                title: "Real-Time Preview",
                description:
                  "See your design come to life instantly with our 3D customizer.",
              },
            ].map((feature, i) => (
              <div key={i} className="glass p-6 rounded-lg hover:scale-[1.02] transition-transform">
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <FooterColumn
              title="Shop"
              links={[
                { label: "Collections", href: "/shop" },
                { label: "Customize", href: "/design" },
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { label: "About", href: "/about" },
                { label: "Contact", href: "#" },
              ]}
            />
            <FooterColumn
              title="Legal"
              links={[
                { label: "Privacy", href: "#" },
                { label: "Terms", href: "#" },
              ]}
            />
            <FooterColumn
              title="Follow"
              links={[
                { label: "Instagram", href: "#" },
                { label: "Twitter", href: "#" },
              ]}
            />
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>
              &copy; 2025 trapo. All rights reserved. We don't sell clothes. We sell expression.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  return (
    <div>
      <h4 className="font-semibold mb-4">{title}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map((link, i) => (
          <li key={i}>
            <Link href={link.href} className="hover:text-foreground transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
