"use client"

import Link from "next/link"
import { ShoppingCart, Star, Filter, Search } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useState, useEffect } from "react"
import { productsAPI } from "@/lib/api"
import Image from "next/image"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  colors?: string[]
  sizes?: string[]
  inStock: boolean
}

export function Products() {
  const { addToCart } = useCart()
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("name")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await productsAPI.getAll()
        setProducts(data)
        setFilteredProducts(data)
      } catch (err) {
        console.error("Failed to fetch products:", err)
        setError("Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // Filter and search products
  useEffect(() => {
    let filtered = products

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name":
          return a.name.localeCompare(b.name)
        case "category":
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory, sortBy])

  const handleAddToCart = (item: Product) => {
    addToCart({
      id: `product-${item._id}`,
      name: item.name,
      price: item.price,
      quantity: 1,
      type: "product",
      productId: item._id,
    })

    setAddedItems((prev) => new Set(prev).add(item._id))
    setTimeout(() => {
      setAddedItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(item._id)
        return newSet
      })
    }, 2000)
  }

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))]

  if (loading) {
    return (
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Mahsulotlar yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Mahsulotlar</h1>
          <p className="text-muted-foreground mb-6">
            Bizning keng assortimentdagi mahsulotlarimizdan tanlang
          </p>
        </div>

        {/* Filters and Search */}
        <div className="glass rounded-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Mahsulot qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="name">Ism bo'yicha</option>
              <option value="price-low">Narx: Pastdan yuqoriga</option>
              <option value="price-high">Narx: Yuqoridan pastga</option>
              <option value="category">Kategoriya bo'yicha</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {filteredProducts.length} ta mahsulot topildi
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">Hech qanday mahsulot topilmadi</p>
            <button
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("All")
              }}
              className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90"
            >
              Filtrlarni tozalash
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="glass rounded-lg overflow-hidden hover:border-accent transition-all duration-300 group"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                      🎨
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      Tugagan
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <p className="text-xs text-accent mb-2 font-semibold">{product.category}</p>
                  <h3 className="text-lg font-bold mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Colors and Sizes */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-muted-foreground mb-1">Ranglar:</p>
                      <div className="flex flex-wrap gap-1">
                        {product.colors.slice(0, 3).map((color, index) => (
                          <span
                            key={index}
                            className="text-xs bg-muted px-2 py-1 rounded"
                          >
                            {color}
                          </span>
                        ))}
                        {product.colors.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{product.colors.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Price and Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold">${product.price}</span>
                      {product.sizes && product.sizes.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {product.sizes.length} ta o'lcham
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      className={`p-2 rounded-lg transition-all ${
                        addedItems.has(product._id)
                          ? "bg-green-500 text-white"
                          : product.inStock
                          ? "bg-accent text-accent-foreground hover:opacity-90"
                          : "bg-muted text-muted-foreground cursor-not-allowed"
                      }`}
                    >
                      <ShoppingCart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="glass rounded-lg p-8 mt-12">
          <h2 className="text-2xl font-bold mb-4">Nima uchun bizni tanlash kerak?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Yuqori sifat</h3>
              <p className="text-muted-foreground text-sm">
                Barqaror materiallar va diqqat bilan tayyorlangan mahsulotlar.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Keng assortiment</h3>
              <p className="text-muted-foreground text-sm">
                Turli xil kategoriyalardagi mahsulotlar va rang tanlovi.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Tez yetkazib berish</h3>
              <p className="text-muted-foreground text-sm">
                Sifatni buzmasdan tez yetkazib berish xizmati.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
