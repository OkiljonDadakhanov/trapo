"use client"

import { Navbar } from "@/components/navbar"
import { DesignStudio } from "@/components/design-studio"

export default function DesignPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <DesignStudio />
    </main>
  )
}
