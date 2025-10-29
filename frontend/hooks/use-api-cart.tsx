"use client"

import { useState, useCallback } from "react"
import { ordersAPI, designsAPI } from "@/lib/api"

export const useAPICart = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const saveDesign = useCallback(async (design: any) => {
    setLoading(true)
    setError(null)
    try {
      const result = await designsAPI.create(design)
      return result
    } catch (err) {
      const message = (err as Error).message
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createOrder = useCallback(async (orderData: any) => {
    setLoading(true)
    setError(null)
    try {
      const result = await ordersAPI.create(orderData)
      return result
    } catch (err) {
      const message = (err as Error).message
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    saveDesign,
    createOrder,
    loading,
    error,
  }
}
