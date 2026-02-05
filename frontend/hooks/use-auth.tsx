"use client"

import { useState, useEffect, useCallback } from "react"
import { authAPI } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")
    if (savedToken) {
      setToken(savedToken)
      try {
        setUser(savedUser ? JSON.parse(savedUser) : null)
      } catch {
        setUser(null)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const { token: newToken, user: newUser } = await authAPI.register(name, email, password)
      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(newUser))
      setToken(newToken)
      setUser(newUser)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { token: newToken, user: newUser } = await authAPI.login(email, password)
      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(newUser))
      setToken(newToken)
      setUser(newUser)
      return { success: true }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }, [])

  return {
    user,
    token,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!token,
  }
}
