"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function About() {
  return (
    <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="text-5xl font-bold mb-4">We don't sell clothes.</h1>
          <h2 className="text-3xl text-accent mb-6">We sell expression.</h2>
          <p className="text-lg text-muted-foreground">
            trapo. is a creative streetwear lab dedicated to empowering individuals to express their unique identity
            through custom-designed clothing.
          </p>
        </div>

        {/* Mission Section */}
        <div className="glass rounded-lg p-8 mb-8">
          <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
          <p className="text-muted-foreground mb-4">
            At trapo., we believe that fashion is a form of self-expression. We've created a platform where creativity
            meets craftsmanship, allowing you to design pieces that truly represent who you are.
          </p>
          <p className="text-muted-foreground">
            Every sticker, every color choice, every design decision is yours. We're here to make it easy, accessible,
            and fun.
          </p>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: "Creativity",
              description: "We empower unlimited creative expression through our design tools and sticker collections.",
            },
            {
              title: "Quality",
              description: "Premium materials and meticulous craftsmanship ensure your designs look and feel amazing.",
            },
            {
              title: "Sustainability",
              description: "We're committed to eco-friendly practices and sustainable production methods.",
            },
          ].map((value, i) => (
            <div key={i} className="glass rounded-lg p-6">
              <h4 className="text-lg font-bold mb-2">{value.title}</h4>
              <p className="text-muted-foreground text-sm">{value.description}</p>
            </div>
          ))}
        </div>

        {/* Story Section */}
        <div className="glass rounded-lg p-8 mb-12">
          <h3 className="text-2xl font-bold mb-4">Our Story</h3>
          <p className="text-muted-foreground mb-4">
            trapo. was born from a simple idea: what if designing your own clothing was as easy and fun as it should be?
            We started with a vision to democratize fashion design and make it accessible to everyone.
          </p>
          <p className="text-muted-foreground mb-4">
            Today, we're a team of designers, developers, and creative minds working together to push the boundaries of
            what's possible in custom streetwear.
          </p>
          <p className="text-muted-foreground">
            Every piece created through trapo. is a statement. It's your story, your style, your vibe.
          </p>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to express yourself?</h3>
          <Link
            href="/design"
            className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Start Designing
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  )
}
