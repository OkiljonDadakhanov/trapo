"use client"

import { Navbar } from "@/components/navbar"
import { Products } from "@/components/products"

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Products />
    </main>
  )
}
