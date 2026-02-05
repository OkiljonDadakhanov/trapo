"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { ordersAPI, usersAPI } from "@/lib/api"
import { useCustomToast } from "@/components/custom-toast"

export function Checkout() {
  const router = useRouter()
  const toast = useCustomToast()
  const { items, total, clearCart } = useCart()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileIncomplete, setProfileIncomplete] = useState(false)
  const [useProfileAddress, setUseProfileAddress] = useState(false)

  // Fetch user profile and pre-fill the form
  useEffect(() => {
    const fetchProfileAndFillForm = async () => {
      try {
        const userData = await usersAPI.getProfile()
        
        // Check if profile has complete shipping info
        const hasShippingInfo = 
          userData.profile?.firstName &&
          userData.profile?.lastName &&
          userData.profile?.phone &&
          userData.profile?.address?.street &&
          userData.profile?.address?.city &&
          userData.profile?.address?.state &&
          userData.profile?.address?.zipCode &&
          userData.profile?.address?.country

        if (hasShippingInfo) {
          // Pre-fill form with profile data and allow confirmation
          setFormData({
            firstName: userData.profile.firstName || "",
            lastName: userData.profile.lastName || "",
            email: userData.email || "",
            phone: userData.profile.phone || "",
            address: userData.profile.address.street || "",
            city: userData.profile.address.city || "",
            state: userData.profile.address.state || "",
            zip: userData.profile.address.zipCode || "",
            country: userData.profile.address.country || "",
          })
          setUseProfileAddress(true)
        } else {
          // Profile incomplete, show message
          setProfileIncomplete(true)
          toast.warning(
            "Shipping Information Required",
            "Please complete your profile shipping address to continue"
          )
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error)
        toast.error("Error", "Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchProfileAndFillForm()
  }, [toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)

    try {
      const orderData = {
        items: items.map((item) => ({
          type: "custom" as const, // Using "custom" type for all items in demo
          customId: item.id || `item-${Date.now()}-${Math.random()}`,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
        customerInfo: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zip,
          country: formData.country,
        },
        subtotal: total,
        shipping: 0,
        tax: 0,
        total: total,
      }

      console.log("Creating order with data:", JSON.stringify(orderData, null, 2))
      const order = await ordersAPI.create(orderData)
      console.log("Order created successfully:", order)

      clearCart()

      // Redirect to confirmation page with order data
      const params = new URLSearchParams({
        orderId: order._id,
        order: order.orderNumber,
        name: `${formData.firstName} ${formData.lastName}`,
        total: order.total.toFixed(2),
      })

      router.push(`/order-confirmation?${params.toString()}`)
    } catch (err) {
      console.error("Order creation error:", err)
      const errorMessage = (err as Error).message || "Failed to create order. Please try again."
      setError(errorMessage)
      toast.error("Order Failed", errorMessage)
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Checkout</h1>
          <p className="text-muted-foreground mb-8">Your cart is empty. Add items to proceed.</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const shippingCost = 0
  const tax = 0
  const finalTotal = total

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-4">
            <ArrowLeft size={18} />
            Back to Cart
          </Link>
          <h1 className="text-4xl font-bold">Checkout</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">{error}</div>
        )}

        {profileIncomplete && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-500/20 rounded-lg">
                <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-500 mb-1">Complete Your Profile to Continue</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Please add your shipping information to your profile before placing an order.
                </p>
                <Link
                  href="/profile"
                  className="inline-block px-4 py-2 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                >
                  Go to Profile
                </Link>
              </div>
            </div>
          </div>
        )}

        {useProfileAddress && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-500 mb-1">Shipping Address Found</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  We found your shipping address from your profile. Please review and confirm it's correct below.
                </p>
                <p className="text-xs text-muted-foreground">
                  {formData.firstName} {formData.lastName}, {formData.address}, {formData.city}, {formData.state} {formData.zip}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping Information */}
              <div className="glass rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Shipping Information</h2>
                  {useProfileAddress && (
                    <button
                      type="button"
                      onClick={() => {
                        toast.info("Edit Address", "You can now edit the shipping information")
                        setUseProfileAddress(false)
                      }}
                      className="text-sm text-accent hover:underline"
                    >
                      Edit Address
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={useProfileAddress}
                    className="col-span-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={useProfileAddress}
                    className="col-span-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={useProfileAddress}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={useProfileAddress}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
                <input
                  type="text"
                  name="address"
                  placeholder="Address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={useProfileAddress}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
                  required
                />
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    disabled={useProfileAddress}
                    className="col-span-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleChange}
                    disabled={useProfileAddress}
                    className="col-span-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <input
                    type="text"
                    name="zip"
                    placeholder="ZIP Code"
                    value={formData.zip}
                    onChange={handleChange}
                    disabled={useProfileAddress}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  />
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={handleChange}
                    disabled={useProfileAddress}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div className="glass rounded-lg p-6 bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-500">Demo Mode - No Payment Required</h3>
                    <p className="text-sm text-muted-foreground">
                      This is a demo checkout. No payment will be processed.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || profileIncomplete}
                className="w-full py-3 bg-accent text-accent-foreground rounded-lg font-bold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing 
                  ? "Processing..." 
                  : profileIncomplete 
                  ? "Complete Profile First" 
                  : "Complete Order"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4 pb-4 border-b border-white/10">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} x{item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 mb-6 pb-6 border-b border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-500">Free</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-lg mb-6">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
              <div className="glass-dark rounded-lg p-4 text-sm">
                <p className="mb-2 text-muted-foreground">
                  <strong className="text-foreground">✨ Free Shipping</strong> on all orders
                </p>
                <p className="text-xs text-muted-foreground">
                  Your order will be processed immediately after confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
