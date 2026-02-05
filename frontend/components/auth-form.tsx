"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogIn, UserPlus, Eye, EyeOff } from "lucide-react"
import { authAPI } from "@/lib/api"
import { useCustomToast } from "@/components/custom-toast"

interface AuthFormProps {
  mode: "login" | "register"
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const toast = useCustomToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === "login") {
        const response = await authAPI.login(formData.email, formData.password)
        localStorage.setItem("token", response.token)
        toast.success("Login Successful", `Welcome back, ${response.user.name}!`)
        router.push("/profile")
      } else {
        if (formData.password !== formData.confirmPassword) {
          toast.error("Registration Error", "Passwords do not match")
          return
        }
        const response = await authAPI.register(
          formData.name,
          formData.email,
          formData.password
        )
        localStorage.setItem("token", response.token)
        toast.success("Registration Successful", `Welcome, ${response.user.name}!`)
        router.push("/profile")
      }
    } catch (error) {
      toast.error(
        mode === "login" ? "Login Error" : "Registration Error",
        (error as Error).message || "An unexpected error occurred"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="glass rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              {mode === "login" ? <LogIn size={32} /> : <UserPlus size={32} />}
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {mode === "login" ? "Welcome Back" : "Join trapo."}
            </h1>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Sign in to your account to continue"
                : "Create your account to start designing"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent bg-background"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading
                ? "Loading..."
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
              <Link
                href={mode === "login" ? "/auth/register" : "/auth/login"}
                className="text-accent hover:underline font-medium"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
