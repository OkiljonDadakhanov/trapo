"use client"

import Link from "next/link"
import {
  ShoppingCart,
  Menu,
  X,
  Moon,
  Sun,
  User,
  LogIn,
  UserPlus,
  LogOut,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useCart } from "@/hooks/use-cart"
import { usersAPI } from "@/lib/api" // ✅ switched from authAPI → usersAPI
import { useCustomToast } from "@/components/custom-toast"

interface User {
  _id: string
  name: string
  email: string
}

export function Navbar() {
  const toast = useCustomToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { items } = useCart()

  useEffect(() => {
    setMounted(true)

    // 🌓 Theme setup
    const isDarkMode =
      localStorage.getItem("theme") === "dark" || !localStorage.getItem("theme")
    setIsDark(isDarkMode)
    document.documentElement.classList.toggle("dark", isDarkMode)

    // 👤 Check user authentication
    const token = localStorage.getItem("token")
    if (token) {
      usersAPI
        .getProfile()
        .then((userData) => setUser(userData))
        .catch(() => {
          localStorage.removeItem("token")
          setUser(null)
        })
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    setUser(null)
    setShowUserMenu(false)
    toast.success("Logged out successfully", "You have been logged out")
  }

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    localStorage.setItem("theme", newIsDark ? "dark" : "light")
    document.documentElement.classList.toggle("dark", newIsDark)
  }

  if (!mounted) return null

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-tight">
            trapo<span className="text-accent">.</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center">
            <Link href="/design" className="text-sm hover:text-accent transition-colors">
              Design Studio
            </Link>
            <Link href="/stickers" className="text-sm hover:text-accent transition-colors">
              Stickers
            </Link>
            <Link href="/shop" className="text-sm hover:text-accent transition-colors">
              Shop
            </Link>
           
            <Link href="/about" className="text-sm hover:text-accent transition-colors">
              About
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:text-accent transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 hover:text-accent transition-colors">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 hover:text-accent transition-colors"
                >
                  <User size={20} />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User size={16} /> Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted transition-colors w-full text-left"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1 px-3 py-1 text-sm hover:text-accent transition-colors"
                >
                  <LogIn size={16} /> Login
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-accent text-accent-foreground rounded hover:opacity-90 transition-opacity"
                >
                  <UserPlus size={16} /> Register
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {["design", "stickers", "shop",  "about"].map((page) => (
              <Link
                key={page}
                href={`/${page}`}
                className="block text-sm hover:text-accent transition-colors py-2"
              >
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </Link>
            ))}

            {user ? (
              <>
                <Link href="/profile" className="block text-sm hover:text-accent transition-colors py-2">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-sm hover:text-accent transition-colors py-2 w-full text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="block text-sm hover:text-accent transition-colors py-2">
                  Login
                </Link>
                <Link href="/auth/register" className="block text-sm hover:text-accent transition-colors py-2">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
