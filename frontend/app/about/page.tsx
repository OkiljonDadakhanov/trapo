"use client"

import { Navbar } from "@/components/navbar"
import { About } from "@/components/about"

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <About />
    </main>
  )
}
