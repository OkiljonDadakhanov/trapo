"use client"
"use strict"

import { useEffect, useRef, useState } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"

interface Sticker {
  id: string
  x: number
  y: number
  scale: number
  rotation: number
  surface: "front" | "back" | "sleeve"
  zIndex: number
}

interface TryOnProps {
  productType: string
  color: string
  stickers: Sticker[]
}

export function TryOn({ productType, color, stickers }: TryOnProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [height, setHeight] = useState(170)
  const [weight, setWeight] = useState(70)
  const [gender, setGender] = useState<"male" | "female">("male")
  const [isLoading, setIsLoading] = useState(true)
  // fabric.js Canvas type - using unknown due to dynamic import
  const fabricCanvasRef = useRef<{ dispose: () => void; add: (obj: unknown) => void; renderAll: () => void } | null>(null)

  // Helper: find first existing image file among possible extensions
  const resolveImage = async (basePath: string): Promise<string> => {
    const exts = [".png", ".jpg", ".jpeg", ".webp", ".jfif"]
    for (const ext of exts) {
      const url = `${basePath}${ext}`
      try {
        const res = await fetch(url, { method: "HEAD" })
        if (res.ok) return url
      } catch {
        continue
      }
    }
    throw new Error(`No valid image found for ${basePath}`)
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fabric: { Canvas: new (el: HTMLCanvasElement, opts: object) => typeof fabricCanvasRef.current; Image: { fromURL: (url: string, callback: (img: unknown) => void, opts: object) => void } }
    let canvas: typeof fabricCanvasRef.current
    let disposed = false

    const init = async () => {
      if (!canvasRef.current) return
      setIsLoading(true)

      // 🧹 Dispose previous canvas if it exists
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose()
        fabricCanvasRef.current = null
      }

      try {
        fabric = await import("fabric")
        canvas = new fabric.Canvas(canvasRef.current, {
          width: 600,
          height: 800,
          backgroundColor: "#f8f8f8",
        })
        fabricCanvasRef.current = canvas

        const loadImage = (url: string) =>
          new Promise<{ scale: (n: number) => void; scaleX: number; scaleY: number; center: () => void; set: (opts: object) => void }>((resolve, reject) => {
            fabric.Image.fromURL(
              url,
              (img) => (img ? resolve(img as { scale: (n: number) => void; scaleX: number; scaleY: number; center: () => void; set: (opts: object) => void }) : reject("Image failed")),
              { crossOrigin: "anonymous" },
            )
          })

        // 🧍 Mannequin
        const mannequinBase = `/images/mannequins/${gender}-${height > 180 ? "tall" : "regular"}`
        const mannequinUrl = await resolveImage(mannequinBase)
        const mannequin = await loadImage(mannequinUrl)
        const scale = height / 180
        const widthScale = (weight / 70) * scale
        mannequin.scale(scale)
        mannequin.scaleX = widthScale
        mannequin.center()
        canvas.add(mannequin)

        // 👕 Clothing
        const productBase = `/images/products/${productType}`
        const clothingUrl = await resolveImage(productBase)
        const clothing = await loadImage(clothingUrl)
        clothing.set({ fill: color, globalCompositeOperation: "source-atop" })
        clothing.center()
        canvas.add(clothing)

        // 🩵 Stickers
        for (const sticker of stickers) {
          const stickerUrl = `/api/stickers/${sticker.id}`
          try {
            const stickerImg = await loadImage(stickerUrl)
            stickerImg.set({
              left: sticker.x,
              top: sticker.y,
              angle: sticker.rotation,
              scaleX: sticker.scale,
              scaleY: sticker.scale,
            })
            canvas.add(stickerImg)
          } catch (err) {
            console.warn(`Sticker ${sticker.id} failed to load`, err)
          }
        }

        if (!disposed) canvas.renderAll()
      } catch (err) {
        console.error("Canvas init error:", err)
      } finally {
        if (!disposed) setIsLoading(false)
      }
    }

    init()

    // ✅ Cleanup
    return () => {
      disposed = true
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose()
        fabricCanvasRef.current = null
      }
    }
  }, [productType, color, height, weight, gender, stickers])

  return (
    <div className="flex flex-col gap-6 p-4">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Virtual Try-On</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="height">Height (cm)</Label>
            <Input id="height" type="number" value={height} onChange={(e) => setHeight(+e.target.value)} min={140} max={220} />
          </div>
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(+e.target.value)} min={40} max={150} />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Button variant={gender === "male" ? "default" : "outline"} onClick={() => setGender("male")}>
            Male
          </Button>
          <Button variant={gender === "female" ? "default" : "outline"} onClick={() => setGender("female")}>
            Female
          </Button>
        </div>
      </Card>

      <Card className="p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        )}
        <canvas ref={canvasRef} className="w-full h-auto" />
      </Card>
    </div>
  )
}
