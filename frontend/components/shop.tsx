"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useState, useEffect } from "react"
import { productsAPI } from "@/lib/api"
import { useCustomToast } from "@/components/custom-toast"
import Image from "next/image"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
}

export function Shop() {
  const { addToCart } = useCart()
  const toast = useCustomToast() // ✅ changed here
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await productsAPI.getAll()
        setProducts(data)
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Failed to load products")

        // Fallback mock data
        setProducts([
          {
            _id: "1",
            name: "Urban Essentials",
            description: "Classic streetwear staples with modern edge.",
            price: 89,
            category: "Hoodies",
          },
          {
            _id: "2",
            name: "Minimalist Tee",
            description: "Clean lines, maximum impact.",
            price: 49,
            category: "T-Shirts",
          },
          {
            _id: "3",
            name: "Street Cap",
            description: "Complete your look with our signature cap.",
            price: 39,
            category: "Caps",
          },
          {
            _id: "4",
            name: "Premium Sweatshirt",
            description: "Comfort meets style in our premium collection.",
            price: 79,
            category: "Sweatshirts",
          },
          {
            _id: "5",
            name: "Limited Edition Hoodie",
            description: "Exclusive design available for a limited time.",
            price: 129,
            category: "Hoodies",
          },
          {
            _id: "6",
            name: "Oversized Tee",
            description: "Relaxed fit with bold presence.",
            price: 59,
            category: "T-Shirts",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleAddToCart = (item: Product) => {
    const token = localStorage.getItem("token")

    if (!token) {
      toast.warning(
        "Authentication Required",
        "Please login or register to add items to your cart"
      )
      return
    }

    addToCart({
      id: `preset-${item._id}`,
      name: item.name,
      price: item.price,
      quantity: 1,
      type: "preset",
    })

    setAddedItems((prev) => new Set(prev).add(item._id))
    toast.success("Added to Cart", `${item.name} has been added to your cart`)

    setTimeout(() => {
      setAddedItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(item._id)
        return newSet
      })
    }, 2000)
  }

  if (loading) {
    return (
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Shop Collection</h1>
          <p className="text-muted-foreground mb-6">
            Pre-made designs from our creative team. Or customize your own.
          </p>
          <Link
            href="/design"
            className="inline-block px-6 py-2 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Create Custom Design
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {products.map((item) => (
            <div
              key={item._id}
              className="glass rounded-lg overflow-hidden hover:border-accent transition-colors group"
            >
              {/* Product Image */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 relative h-48 group-hover:scale-110 transition-transform overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-6xl">🖤</div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6">
                <p className="text-xs text-accent mb-2 font-semibold">
                  {item.category}
                </p>
                <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {item.description}
                </p>

                {/* Price and Button */}
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold">${item.price}</span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className={`p-2 rounded-lg transition-all ${addedItems.has(item._id)
                        ? "bg-green-500 text-white"
                        : "bg-accent text-accent-foreground hover:opacity-90"
                      }`}
                  >
                    <ShoppingCart size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="glass rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Why Choose trapo.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Premium Quality</h3>
              <p className="text-muted-foreground text-sm">
                Crafted with sustainable materials and meticulous attention to detail.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Custom Design</h3>
              <p className="text-muted-foreground text-sm">
                Use our design studio to create truly unique pieces that express your style.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Fast Shipping</h3>
              <p className="text-muted-foreground text-sm">
                Get your custom designs delivered quickly without compromising quality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
