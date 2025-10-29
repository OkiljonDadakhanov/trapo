"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./use-auth"

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  type: "preset" | "custom"
  customDesign?: {
    color: string
    size: string
    surface: string
    stickers: Array<{ id: string; x: number; y: number; scale: number; rotation: number }>
  }
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  total: number
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Load cart from localStorage as fallback, or from API if user is logged in
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          setLoading(true)
          // In a real app, you'd fetch cart from API
          // For now, use localStorage as fallback
          const saved = localStorage.getItem("trapo-cart")
          if (saved) {
            setItems(JSON.parse(saved))
          }
        } catch (e) {
          console.error("[v0] Failed to load cart:", e)
        } finally {
          setLoading(false)
        }
      } else {
        // Load from localStorage for non-authenticated users
        const saved = localStorage.getItem("trapo-cart")
        if (saved) {
          try {
            setItems(JSON.parse(saved))
          } catch (e) {
            console.error("[v0] Failed to load cart:", e)
          }
        }
      }
      setMounted(true)
    }

    loadCart()
  }, [user])

  // Save cart to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("trapo-cart", JSON.stringify(items))
    }
  }, [items, mounted])

  const addToCart = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i))
      }
      return [...prev, item]
    })
  }

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
    } else {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
    }
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, loading }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
