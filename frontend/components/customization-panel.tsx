"use client"

import { useState } from "react"
import { ChevronDown, Trash2, Plus, Minus, Download, Share2, Save, ShoppingCart } from "lucide-react"

type Surface = "front" | "back" | "sleeve"

interface CustomizationPanelProps {
  productType: string
  setProductType: (type: string) => void
  size: string
  setSize: (size: string) => void
  color: string
  setColor: (color: string) => void
  stickers: Array<{
    id: string
    x: number
    y: number
    scale: number
    rotation: number
    surface: Surface
    zIndex: number
  }>
  selectedSticker: string | null
  onAddSticker: (id: string) => void
  onRemoveSticker: (id: string) => void
  onUpdateSticker: (id: string, updates: Partial<{ x: number; y: number; scale: number; rotation: number; surface: Surface; zIndex: number }>) => void
  totalPrice: number
  onSaveDesign: () => void
  onExportDesign: () => void
  onShareDesign: () => void
  onAddToCart: () => void
  addedToCart: boolean
  savingDesign?: boolean
}

export function CustomizationPanel({
  productType,
  setProductType,
  size,
  setSize,
  color,
  setColor,
  stickers,
  selectedSticker,
  onAddSticker,
  onRemoveSticker,
  onUpdateSticker,
  totalPrice,
  onSaveDesign,
  onExportDesign,
  onShareDesign,
  onAddToCart,
  addedToCart,
  savingDesign = false,
}: CustomizationPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("product")

  const stickerPacks = [
    { id: "star", name: "Star", emoji: "⭐", theme: "minimal", premium: false },
    { id: "heart", name: "Heart", emoji: "❤️", theme: "minimal", premium: false },
    { id: "skull", name: "Skull", emoji: "💀", theme: "street", premium: false },
    { id: "lightning", name: "Lightning", emoji: "⚡", theme: "street", premium: false },
    { id: "fire", name: "Fire", emoji: "🔥", theme: "street", premium: true },
    { id: "diamond", name: "Diamond", emoji: "💎", theme: "minimal", premium: true },
    { id: "crown", name: "Crown", emoji: "👑", theme: "street", premium: false },
    { id: "moon", name: "Moon", emoji: "🌙", theme: "minimal", premium: false },
    { id: "anime_1", name: "Torii Gate", emoji: "⛩️", theme: "anime", premium: true },
    { id: "anime_2", name: "Flag", emoji: "🎌", theme: "anime", premium: false },
    { id: "minimal_1", name: "Diamond Shape", emoji: "◆", theme: "minimal", premium: false },
    { id: "minimal_2", name: "Circle", emoji: "○", theme: "minimal", premium: false },
    { id: "abstract_1", name: "Sparkle", emoji: "✨", theme: "abstract", premium: false },
    { id: "abstract_2", name: "Swirl", emoji: "🌀", theme: "abstract", premium: true },
  ]

  const colors = [
    { name: "Black", value: "#000000" },
    { name: "White", value: "#FFFFFF" },
    { name: "Gray", value: "#808080" },
    { name: "Navy", value: "#001F3F" },
    { name: "Red", value: "#FF4136" },
    { name: "Purple", value: "#B10DC9" },
  ]

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const themes = ["all", "street", "minimal", "anime", "abstract"]
  const [selectedTheme, setSelectedTheme] = useState("all")

  const filteredStickers = stickerPacks.filter((pack) => selectedTheme === "all" || pack.theme === selectedTheme)

  return (
    <div className="space-y-4">
      {/* Product Type */}
      <div className="glass rounded-lg p-4">
        <button
          onClick={() => toggleSection("product")}
          className="w-full flex justify-between items-center font-semibold mb-3"
        >
          Product Type
          <ChevronDown size={18} className={expandedSection === "product" ? "rotate-180" : ""} />
        </button>
        {expandedSection === "product" && (
          <div className="space-y-2">
            {["hoodie", "tshirt", "cap", "sweatshirt"].map((type) => (
              <button
                key={type}
                onClick={() => setProductType(type)}
                className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-colors ${
                  productType === type ? "bg-accent text-accent-foreground" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, " $1")}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Size */}
      <div className="glass rounded-lg p-4">
        <button
          onClick={() => toggleSection("size")}
          className="w-full flex justify-between items-center font-semibold mb-3"
        >
          Size
          <ChevronDown size={18} className={expandedSection === "size" ? "rotate-180" : ""} />
        </button>
        {expandedSection === "size" && (
          <div className="grid grid-cols-4 gap-2">
            {["XS", "S", "M", "L", "XL"].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                  size === s ? "bg-accent text-accent-foreground" : "bg-white/10 hover:bg-white/20"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Color */}
      <div className="glass rounded-lg p-4">
        <button
          onClick={() => toggleSection("color")}
          className="w-full flex justify-between items-center font-semibold mb-3"
        >
          Color
          <ChevronDown size={18} className={expandedSection === "color" ? "rotate-180" : ""} />
        </button>
        {expandedSection === "color" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    color === c.value ? "ring-2 ring-accent" : ""
                  }`}
                  style={{ backgroundColor: c.value, color: c.value === "#FFFFFF" ? "#000" : "#fff" }}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      <div className="glass rounded-lg p-4">
        <button
          onClick={() => toggleSection("stickers")}
          className="w-full flex justify-between items-center font-semibold mb-3"
        >
          Stickers & Designs
          <ChevronDown size={18} className={expandedSection === "stickers" ? "rotate-180" : ""} />
        </button>
        {expandedSection === "stickers" && (
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {themes.map((theme) => (
                <button
                  key={theme}
                  onClick={() => setSelectedTheme(theme)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    selectedTheme === theme ? "bg-accent text-accent-foreground" : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {filteredStickers.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => onAddSticker(pack.id)}
                  className="py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-2xl relative group"
                  title={pack.name}
                >
                  {pack.emoji}
                  {pack.premium && (
                    <span className="absolute top-0 right-0 text-xs bg-yellow-500 text-black rounded-full w-4 h-4 flex items-center justify-center">
                      ★
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Sticker Controls */}
      {selectedSticker && (
        <div className="glass rounded-lg p-4">
          <h4 className="font-semibold mb-3">Sticker Controls</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Scale</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const sticker = stickers.find((s) => s.id === selectedSticker)
                    if (sticker && sticker.scale > 0.5) {
                      onUpdateSticker(selectedSticker, { scale: sticker.scale - 0.2 })
                    }
                  }}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Minus size={16} className="mx-auto" />
                </button>
                <button
                  onClick={() => {
                    const sticker = stickers.find((s) => s.id === selectedSticker)
                    if (sticker && sticker.scale < 2) {
                      onUpdateSticker(selectedSticker, { scale: sticker.scale + 0.2 })
                    }
                  }}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Plus size={16} className="mx-auto" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Layer</label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const sticker = stickers.find((s) => s.id === selectedSticker)
                    if (sticker && sticker.zIndex > 0) {
                      onUpdateSticker(selectedSticker, { zIndex: sticker.zIndex - 1 })
                    }
                  }}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-xs font-semibold"
                >
                  Send Back
                </button>
                <button
                  onClick={() => {
                    const sticker = stickers.find((s) => s.id === selectedSticker)
                    if (sticker) {
                      const maxZ = Math.max(...stickers.map((s) => s.zIndex), 0)
                      onUpdateSticker(selectedSticker, { zIndex: maxZ + 1 })
                    }
                  }}
                  className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-xs font-semibold"
                >
                  Bring Front
                </button>
              </div>
            </div>

            <button
              onClick={() => onRemoveSticker(selectedSticker)}
              className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Remove Sticker
            </button>
          </div>
        </div>
      )}

      <div className="glass rounded-lg p-4 space-y-2">
        <button
          onClick={onSaveDesign}
          disabled={savingDesign}
          className="w-full py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {savingDesign ? "Saving..." : "Save Design"}
        </button>
        <button
          onClick={onExportDesign}
          className="w-full py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Download size={16} />
          Export as PNG
        </button>
        <button
          onClick={onShareDesign}
          className="w-full py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Share2 size={16} />
          Share Design
        </button>
      </div>

      {/* Price Summary */}
      <div className="glass rounded-lg p-4">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Item</span>
            <span>
              ${productType === "hoodie" ? "89" : productType === "tshirt" ? "49" : productType === "cap" ? "39" : "79"}
            </span>
          </div>
          {stickers.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Stickers ({stickers.length})</span>
              <span>${stickers.length * 5}</span>
            </div>
          )}
        </div>
        <div className="border-t border-white/10 pt-4 mb-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${totalPrice}</span>
          </div>
        </div>
        <button
          onClick={onAddToCart}
          className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${
            addedToCart ? "bg-green-500 text-white" : "bg-accent text-accent-foreground hover:opacity-90"
          }`}
        >
          <ShoppingCart size={18} />
          {addedToCart ? "Added to Cart!" : "Add to Cart"}
        </button>
      </div>
    </div>
  )
}
