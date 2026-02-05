"use client"

import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { ThankYouCard } from "@/components/thank-you-card"
import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get("order") || "TRP-" + Math.random().toString(36).substr(2, 9).toUpperCase()
  const customerName = searchParams.get("name") || "Valued Customer"
  const itemsJson = searchParams.get("items") || "[]"
  const total = Number.parseFloat(searchParams.get("total") || "0")

  let items: Array<{ name: string; quantity: number; price?: number }> = []
  try {
    items = JSON.parse(decodeURIComponent(itemsJson))
  } catch {
    items = [{ name: "Custom Design", quantity: 1, price: 0 }]
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <CheckCircle size={64} className="text-green-500" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-muted-foreground text-lg mb-4">
              Thank you for your purchase. Your order has been received.
            </p>
            <p className="text-accent font-semibold">Order Number: {orderNumber}</p>
          </div>

          {/* Thank You Card */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Your Thank You Card</h2>
            <ThankYouCard orderNumber={orderNumber} customerName={customerName} items={items} total={total} />
          </div>

          {/* Order Details */}
          <div className="glass rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Order Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-semibold">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer Name</span>
                <span className="font-semibold">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Delivery</span>
                <span className="font-semibold">5-7 Business Days</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="glass rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">What's Next?</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>✓ We've received your order and will begin crafting your design</li>
              <li>✓ You'll receive a shipping confirmation email within 24 hours</li>
              <li>✓ Track your order status anytime from your profile</li>
              <li>✓ Share your thank you card on Instagram Stories to show your support!</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <Link
              href="/design"
              className="flex-1 text-center py-3 bg-accent text-accent-foreground rounded-lg font-bold hover:opacity-90 transition-opacity"
            >
              Create Another Design
            </Link>
            <Link
              href="/shop"
              className="flex-1 text-center py-3 border border-accent text-accent rounded-lg font-bold hover:bg-accent/10 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
