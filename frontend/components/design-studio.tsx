"use client"
"use strict"
import { useState } from "react"
import { RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { useAPICart } from "@/hooks/use-api-cart"
import { useAuth } from "@/hooks/use-auth"
import { ClothingPreview } from "./clothing-preview"
import { CustomizationPanel } from "./customization-panel"
import { TryOn } from "./try-on"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

type Surface = "front" | "back" | "sleeve"

export function DesignStudio() {
  const router = useRouter()
  const { addToCart } = useCart()
  const { saveDesign } = useAPICart()
  const { isAuthenticated } = useAuth()

  const [productType, setProductType] = useState("hoodie")
  const [size, setSize] = useState("M")
  const [color, setColor] = useState("#000000")
  const [view, setView] = useState<Surface>("front")
  const [gender, setGender] = useState<"male" | "female">("male")
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [stickers, setStickers] = useState<
    Array<{ id: string; x: number; y: number; scale: number; rotation: number; surface: Surface; zIndex: number }>
  >([])
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState(false)
  const [savingDesign, setSavingDesign] = useState(false)

  const basePrice = { hoodie: 89, tshirt: 49, cap: 39, sweatshirt: 79 }
  const stickerPrice = 5
  const totalPrice = (basePrice[productType as keyof typeof basePrice] || 0) + stickers.length * stickerPrice

  const handleAddSticker = (stickerId: string) => {
    const newSticker = {
      id: stickerId,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
      surface: view,
      zIndex: stickers.length,
    }
    setStickers((prev) => [...prev, newSticker])
    setSelectedSticker(stickerId)
  }

  const handleRemoveSticker = (stickerId: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== stickerId))
    setSelectedSticker(null)
  }

  const handleUpdateSticker = (stickerId: string, updates: Partial<(typeof stickers)[0]>) => {
    setStickers((prev) => prev.map((s) => (s.id === stickerId ? { ...s, ...updates } : s)))
  }

  const handleReset = () => {
    setStickers([])
    setSelectedSticker(null)
    setColor("#000000")
    setProductType("hoodie")
    setSize("M")
    setZoom(1)
    setRotation(0)
  }

  const handleSaveDesign = async () => {
    if (!isAuthenticated) return router.push("/auth/login")
    setSavingDesign(true)

    try {
      const design = {
        name: `${productType} Design`,
        productType,
        size,
        color,
        stickers: stickers.map((s) => ({
          id: s.id,
          x: s.x,
          y: s.y,
          width: s.scale * 100,
          height: s.scale * 100,
          rotation: s.rotation,
          surface: s.surface,
          zIndex: s.zIndex,
        })),
        price: totalPrice,
      }
      await saveDesign(design)
      alert("✅ Design saved to your profile!")
    } catch (err) {
      alert("❌ Failed to save design: " + (err as Error).message)
    } finally {
      setSavingDesign(false)
    }
  }

  const handleExportDesign = () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement | null
    if (!canvas) return
    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = "trapo-design.png"
    link.click()
  }

  const handleShareDesign = () => {
    const encoded = btoa(JSON.stringify({ productType, size, color, stickers }))
    const shareUrl = `${window.location.origin}?design=${encoded}`
    navigator.clipboard.writeText(shareUrl)
    alert("🔗 Design link copied to clipboard!")
  }

  const handleAddToCart = () => {
    const names = {
      hoodie: "Custom Hoodie",
      tshirt: "Custom T-Shirt",
      cap: "Custom Cap",
      sweatshirt: "Custom Sweatshirt",
    }
    addToCart({
      id: `custom-${Date.now()}`,
      name: names[productType as keyof typeof names],
      price: totalPrice,
      quantity: 1,
      type: "custom",
      customDesign: {
        color,
        size,
        surface: view,
        stickers: stickers.map((s) => ({
          id: s.id,
          x: s.x,
          y: s.y,
          scale: s.scale,
          rotation: s.rotation,
        })),
      },
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Design Studio</h1>
          <p className="text-muted-foreground">Customize your fit. Make it yours.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="glass rounded-lg p-8 mb-6">
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="try-on">Try On</TabsTrigger>
                </TabsList>

                <TabsContent value="preview">
                  <ClothingPreview
                    productType={productType}
                    color={color}
                    view={view}
                    gender={gender}
                    stickers={stickers}
                    selectedSticker={selectedSticker}
                    onStickerSelect={setSelectedSticker}
                    onStickerUpdate={handleUpdateSticker}
                    zoom={zoom}
                    onZoomChange={setZoom}
                    rotation={rotation}
                    onRotationChange={setRotation}
                  />
                </TabsContent>

                <TabsContent value="try-on">
                  <TryOn productType={productType} color={color} stickers={stickers} />
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex gap-4 mb-6">
              {(["front", "back"] as Surface[]).map((side) => (
                <button
                  key={side}
                  onClick={() => setView(side)}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                    view === side ? "bg-accent text-accent-foreground" : "glass hover:bg-white/20"
                  }`}
                >
                  {side === "front" ? "Front View" : "Back View"}
                </button>
              ))}
              <button
                onClick={() => setGender(gender === "male" ? "female" : "male")}
                className="flex-1 py-2 rounded-lg font-semibold glass hover:bg-white/20 transition-colors"
              >
                {gender === "male" ? "Male" : "Female"} Model
              </button>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-2 rounded-lg font-semibold glass hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={18} />
              Reset Design
            </button>
          </div>

          <div className="lg:col-span-1">
            <CustomizationPanel
              productType={productType}
              setProductType={setProductType}
              size={size}
              setSize={setSize}
              color={color}
              setColor={setColor}
              stickers={stickers}
              selectedSticker={selectedSticker}
              onAddSticker={handleAddSticker}
              onRemoveSticker={handleRemoveSticker}
              onUpdateSticker={handleUpdateSticker}
              totalPrice={totalPrice}
              onSaveDesign={handleSaveDesign}
              onExportDesign={handleExportDesign}
              onShareDesign={handleShareDesign}
              onAddToCart={handleAddToCart}
              addedToCart={addedToCart}
              savingDesign={savingDesign}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
