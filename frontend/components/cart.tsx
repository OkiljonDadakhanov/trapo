"use client"

import { useCart } from "@/hooks/use-cart"
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react"
import { useCustomToast } from "@/components/custom-toast"

export function Cart() {
  const { items, updateQuantity, removeFromCart, clearCart } = useCart()
  const toast = useCustomToast()

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id)
      toast.info("Item Removed", "The item has been removed from your cart")
    } else {
      updateQuantity(id, newQuantity)
    }
  }

  const handleCheckout = () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast.warning(
        "Authentication Required",
        "Please login to proceed with checkout"
      )
      // Redirect to login
      window.location.href = "/auth/login"
      return
    }

    // Redirect to checkout
    window.location.href = "/checkout"
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <ShoppingCart size={64} className="mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-6">
            Add some items to get started!
          </p>
          <a
            href="/shop"
            className="inline-block px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 🛒 Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="glass rounded-lg p-6">
                <div className="flex items-center gap-4">
                  {/* Item Image */}
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg flex items-center justify-center text-2xl">
                    🖤
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">${item.price}</p>
                    <p className="text-xs text-muted-foreground">Type: {item.type}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity - 1)
                      }
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, item.quantity + 1)
                      }
                      className="p-1 hover:bg-muted rounded"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => {
                      removeFromCart(item.id)
                      toast.error(
                        "Item Removed",
                        `${item.name} has been removed from your cart`
                      )
                    }}
                    className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 🧾 Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-green-500">Free</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity mb-4"
              >
                Proceed to Checkout
              </button>

              <button
                onClick={() => {
                  clearCart()
                  toast.success(
                    "Cart Cleared",
                    "All items have been removed from your cart"
                  )
                }}
                className="w-full py-2 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
