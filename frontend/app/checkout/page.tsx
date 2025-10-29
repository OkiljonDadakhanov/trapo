"use client"

import { Navbar } from "@/components/navbar"
import { Checkout } from "@/components/checkout"

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Checkout />
    </main>
  )
}
