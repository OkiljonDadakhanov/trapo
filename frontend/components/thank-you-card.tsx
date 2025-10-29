"use client"

import { useRef, useEffect, useState } from "react"
import { Download, Share2 } from "lucide-react"

interface ThankYouCardProps {
  orderNumber: string
  customerName: string
  items: Array<{ name: string; quantity: number }>
  total: number
}

export function ThankYouCard({ orderNumber, customerName, items, total }: ThankYouCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cardImage, setCardImage] = useState<string>("")

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size for Instagram Stories (1080x1350)
    canvas.width = 1080
    canvas.height = 1350

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, 1080, 1350)

    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(150, 120)
    ctx.lineTo(930, 120)
    ctx.stroke()

    ctx.fillStyle = "#000000"
    ctx.font = "bold 140px 'Arial Black', sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("trapo", 540, 280)

    ctx.fillStyle = "#a855f7"
    ctx.beginPath()
    ctx.arc(620, 250, 20, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = "#000000"
    ctx.font = "bold 80px 'Arial', sans-serif"
    ctx.fillText("Thank You", 540, 480)

    ctx.fillStyle = "#000000"
    ctx.font = "bold 48px 'Arial', sans-serif"
    ctx.fillText(customerName, 540, 580)

    ctx.strokeStyle = "#e5e5e5"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(200, 620)
    ctx.lineTo(880, 620)
    ctx.stroke()

    ctx.fillStyle = "#666666"
    ctx.font = "24px 'Arial', sans-serif"
    ctx.fillText(`Order #${orderNumber}`, 540, 700)

    ctx.fillStyle = "#000000"
    ctx.font = "bold 32px 'Arial', sans-serif"
    ctx.fillText("Items", 540, 800)

    let yOffset = 870
    items.forEach((item) => {
      ctx.fillStyle = "#333333"
      ctx.font = "28px 'Arial', sans-serif"
      ctx.fillText(`${item.name} × ${item.quantity}`, 540, yOffset)
      yOffset += 60
    })

    ctx.fillStyle = "#a855f7"
    ctx.font = "bold 56px 'Arial Black', sans-serif"
    ctx.fillText(`$${total.toFixed(2)}`, 540, yOffset + 80)

    ctx.fillStyle = "#999999"
    ctx.font = "24px 'Arial', sans-serif"
    ctx.fillText("Crafted with care", 540, yOffset + 160)
    ctx.fillText("Ships in 5-7 days", 540, yOffset + 200)

    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(150, 1280)
    ctx.lineTo(930, 1280)
    ctx.stroke()

    // Convert to image
    setCardImage(canvas.toDataURL("image/png"))
  }, [orderNumber, customerName, items, total])

  const downloadCard = () => {
    const link = document.createElement("a")
    link.href = cardImage
    link.download = `trapo-thank-you-${orderNumber}.png`
    link.click()
  }

  const shareToInstagram = () => {
    // Create a blob from the canvas image
    if (canvasRef.current) {
      canvasRef.current.toBlob((blob) => {
        if (blob) {
          // Create a temporary URL for the blob
          const url = URL.createObjectURL(blob)

          // Instagram Stories share - opens Instagram app or web
          // Note: Direct Instagram Stories sharing requires the Instagram app
          // This opens Instagram with a message about sharing the design
          const instagramUrl = `https://www.instagram.com/`
          window.open(instagramUrl, "_blank")

          // Show alert with instructions
          alert(
            "Open Instagram Stories and upload the downloaded image!\n\nTip: Use the download button first, then share from your phone's camera roll to Instagram Stories.",
          )
        }
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Hidden canvas for generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Card Preview */}
      {cardImage && (
        <div className="glass rounded-lg p-6 overflow-hidden">
          <img src={cardImage || "/placeholder.svg"} alt="Thank you card" className="w-full rounded-lg" />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 flex-col sm:flex-row">
        <button
          onClick={downloadCard}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-accent text-accent-foreground rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          <Download size={20} />
          Download Card
        </button>
        <button
          onClick={shareToInstagram}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          <Share2 size={20} />
          Share to Instagram
        </button>
      </div>
    </div>
  )
}
