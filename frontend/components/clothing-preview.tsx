"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react"

interface Sticker {
  id: string
  x: number
  y: number
  scale: number
  rotation: number
  surface: "front" | "back" | "sleeve"
  zIndex: number
}

interface ClothingPreviewProps {
  productType: string
  color: string
  view: string
  gender: string
  stickers: Sticker[]
  selectedSticker: string | null
  onStickerSelect: (id: string | null) => void
  onStickerUpdate: (id: string, updates: Partial<Sticker>) => void
  zoom: number
  onZoomChange: (zoom: number) => void
  rotation: number
  onRotationChange: (rotation: number) => void
}

export function ClothingPreview({
  productType,
  color,
  view,
  gender,
  stickers,
  selectedSticker,
  onStickerSelect,
  onStickerUpdate,
  zoom,
  onZoomChange,
  rotation,
  onRotationChange,
}: ClothingPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [draggingSticker, setDraggingSticker] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const stickerEmojis: Record<string, string> = {
    star: "⭐",
    heart: "❤️",
    skull: "💀",
    lightning: "⚡",
    fire: "🔥",
    diamond: "💎",
    crown: "👑",
    moon: "🌙",
    anime_1: "🎌",
    anime_2: "⛩️",
    minimal_1: "◆",
    minimal_2: "○",
    abstract_1: "✨",
    abstract_2: "🌀",
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 400
    canvas.height = 500

    // Clear canvas
    ctx.fillStyle = "#1a1a1a"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Apply rotation and zoom
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(zoom, zoom)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)

    // Draw clothing item
    ctx.fillStyle = color
    ctx.strokeStyle = "#333"
    ctx.lineWidth = 2

    if (productType === "hoodie") {
      ctx.beginPath()
      ctx.moveTo(100, 80)
      ctx.lineTo(300, 80)
      ctx.quadraticCurveTo(320, 100, 320, 150)
      ctx.lineTo(320, 400)
      ctx.lineTo(80, 400)
      ctx.lineTo(80, 150)
      ctx.quadraticCurveTo(80, 100, 100, 80)
      ctx.fill()
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(200, 100, 60, Math.PI, 0)
      ctx.fill()
      ctx.stroke()
    } else if (productType === "tshirt") {
      ctx.beginPath()
      ctx.moveTo(120, 100)
      ctx.lineTo(280, 100)
      ctx.lineTo(300, 150)
      ctx.lineTo(300, 400)
      ctx.lineTo(100, 400)
      ctx.lineTo(100, 150)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.fillRect(50, 120, 70, 100)
      ctx.fillRect(280, 120, 70, 100)
    } else if (productType === "cap") {
      ctx.beginPath()
      ctx.arc(200, 150, 80, 0, Math.PI)
      ctx.lineTo(280, 150)
      ctx.lineTo(280, 170)
      ctx.lineTo(120, 170)
      ctx.lineTo(120, 150)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    } else if (productType === "sweatshirt") {
      ctx.beginPath()
      ctx.moveTo(110, 100)
      ctx.lineTo(290, 100)
      ctx.lineTo(310, 130)
      ctx.lineTo(310, 400)
      ctx.lineTo(90, 400)
      ctx.lineTo(90, 130)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()
    }

    const sortedStickers = [...stickers].sort((a, b) => a.zIndex - b.zIndex)
    sortedStickers.forEach((sticker) => {
      const x = (sticker.x / 100) * canvas.width
      const y = (sticker.y / 100) * canvas.height

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((sticker.rotation * Math.PI) / 180)
      ctx.font = `${40 * sticker.scale}px Arial`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(stickerEmojis[sticker.id] || "✨", 0, 0)

      if (sticker.id === selectedSticker) {
        ctx.strokeStyle = "#00ff00"
        ctx.lineWidth = 2
        ctx.strokeRect(-20 * sticker.scale, -20 * sticker.scale, 40 * sticker.scale, 40 * sticker.scale)
      }

      ctx.restore()
    })

    ctx.restore()
  }, [productType, color, stickers, selectedSticker, zoom, rotation])

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    for (let i = stickers.length - 1; i >= 0; i--) {
      const sticker = stickers[i]
      const distance = Math.sqrt(Math.pow(x - sticker.x, 2) + Math.pow(y - sticker.y, 2))
      if (distance < 10) {
        setDraggingSticker(sticker.id)
        setDragOffset({ x: x - sticker.x, y: y - sticker.y })
        onStickerSelect(sticker.id)
        return
      }
    }

    onStickerSelect(null)
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingSticker) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    onStickerUpdate(draggingSticker, {
      x: Math.max(0, Math.min(100, x - dragOffset.x)),
      y: Math.max(0, Math.min(100, y - dragOffset.y)),
    })
  }

  const handleCanvasMouseUp = () => {
    setDraggingSticker(null)
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onZoomChange(Math.max(0.5, zoom - 0.2))}
          className="p-2 bg-accent/20 hover:bg-accent/30 rounded-lg transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={18} />
        </button>
        <span className="px-4 py-2 bg-card rounded-lg text-sm font-semibold">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => onZoomChange(Math.min(2, zoom + 0.2))}
          className="p-2 bg-accent/20 hover:bg-accent/30 rounded-lg transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={() => onRotationChange((rotation + 45) % 360)}
          className="p-2 bg-accent/20 hover:bg-accent/30 rounded-lg transition-colors ml-2"
          title="Rotate"
        >
          <RotateCw size={18} />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        className="w-full max-w-sm border border-border rounded-lg cursor-move bg-black/50"
      />
      <p className="text-sm text-muted-foreground">Drag stickers to reposition them</p>
    </div>
  )
}
