import { Cart } from "@/components/cart"
import { Navbar } from "@/components/navbar"

export default function CartPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Cart />
    </main>
  )
}