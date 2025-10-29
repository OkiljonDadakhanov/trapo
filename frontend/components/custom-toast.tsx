"use client"

import { useToast } from "@/hooks/use-toast"
import { useCallback } from "react"

export function useCustomToast() {
  const { toast: toastFn } = useToast()

  const success = useCallback((title: string, description?: string) => {
    toastFn({
      title,
      description,
      variant: "default",
    })
  }, [toastFn])

  const error = useCallback((title: string, description?: string) => {
    toastFn({
      title,
      description,
      variant: "destructive",
    })
  }, [toastFn])

  const warning = useCallback((title: string, description?: string) => {
    toastFn({
      title,
      description,
      variant: "default",
    })
  }, [toastFn])

  const info = useCallback((title: string, description?: string) => {
    toastFn({
      title,
      description,
      variant: "default",
    })
  }, [toastFn])

  return { success, error, warning, info }
}

