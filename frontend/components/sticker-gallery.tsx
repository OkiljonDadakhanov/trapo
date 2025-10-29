"use client"

import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"
import { useState, useEffect } from "react"
import { stickersAPI } from "@/lib/api"

interface StickerPack {
  _id: string
  name: string
  description: string
  theme: string
  isPremium: boolean
  isDrop: boolean
  stickers: string[]
  color?: string
}

export function StickerGallery() {
  const [selectedTheme, setSelectedTheme] = useState("all")
  const [stickerPacks, setStickerPacks] = useState<StickerPack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStickers = async () => {
      try {
        setLoading(true)
        const data = await stickersAPI.getAll(selectedTheme === "all" ? undefined : selectedTheme)
        setStickerPacks(data)
      } catch (err) {
        console.error("[v0] Failed to fetch stickers:", err)
        setError("Failed to load stickers")
        // Fallback to mock data
        setStickerPacks([
          {
            _id: "street",
            name: "Street Vibes",
            description: "Urban-inspired designs with bold typography and street culture elements.",
            stickers: ["⭐", "💀", "⚡", "🔥"],
            color: "from-purple-500/20 to-pink-500/20",
            theme: "street",
            isPremium: false,
            isDrop: false,
          },
          {
            _id: "minimal",
            name: "Minimal",
            description: "Clean, minimalist designs perfect for understated elegance.",
            stickers: ["◆", "○", "□", "△"],
            color: "from-blue-500/20 to-cyan-500/20",
            theme: "minimal",
            isPremium: false,
            isDrop: false,
          },
          {
            _id: "art",
            name: "Art Inspired",
            description: "Contemporary art-inspired patterns and abstract designs.",
            stickers: ["🎨", "✨", "🌙", "💎"],
            color: "from-orange-500/20 to-red-500/20",
            theme: "abstract",
            isPremium: false,
            isDrop: false,
          },
          {
            _id: "text",
            name: "Text Based",
            description: "Typography-focused designs with powerful messaging.",
            stickers: ["👑", "🔥", "⚡", "💯"],
            color: "from-green-500/20 to-emerald-500/20",
            theme: "street",
            isPremium: false,
            isDrop: false,
          },
          {
            _id: "anime",
            name: "Anime Collection",
            description: "Japanese-inspired anime and manga-style designs.",
            stickers: ["⛩️", "🎌", "🌸", "⚔️"],
            color: "from-red-500/20 to-pink-500/20",
            theme: "anime",
            isPremium: true,
            isDrop: true,
          },
          {
            _id: "neon",
            name: "Neon Dreams",
            description: "Limited edition neon-inspired glowing designs.",
            stickers: ["💜", "💙", "💚", "💛"],
            color: "from-purple-500/40 to-pink-500/40",
            theme: "abstract",
            isPremium: true,
            isDrop: true,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchStickers()
  }, [selectedTheme])

  const themes = ["all", "street", "minimal", "anime", "abstract"]

  if (loading) {
    return (
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">Loading stickers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Sticker Gallery</h1>
          <p className="text-muted-foreground">
            Explore our curated collection of sticker packs and limited-edition drops.
          </p>
        </div>

        {/* Theme Filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {themes.map((theme) => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(theme)}
              className={`px-4 py-2 rounded-full font-semibold transition-colors ${
                selectedTheme === theme ? "bg-accent text-accent-foreground" : "glass hover:bg-white/20"
              }`}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </button>
          ))}
        </div>

        {/* Sticker Packs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {stickerPacks.map((pack) => (
            <div
              key={pack._id}
              className={`glass rounded-lg overflow-hidden hover:border-accent transition-colors relative ${
                pack.isDrop ? "ring-2 ring-yellow-500/50" : ""
              }`}
            >
              {/* Drop Badge */}
              {pack.isDrop && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold z-10">
                  LIMITED DROP
                </div>
              )}

              {/* Pack Preview */}
              <div
                className={`bg-gradient-to-br ${pack.color || "from-purple-500/20 to-pink-500/20"} p-8 flex items-center justify-center gap-4 h-40`}
              >
                {pack.stickers.map((sticker, i) => (
                  <div key={i} className="text-5xl">
                    {sticker}
                  </div>
                ))}
              </div>

              {/* Pack Info */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{pack.name}</h3>
                  {pack.isPremium && <Star size={18} className="text-yellow-500 fill-yellow-500" />}
                </div>
                <p className="text-muted-foreground text-sm mb-4">{pack.description}</p>
                <Link
                  href="/design"
                  className="inline-flex items-center gap-2 text-accent hover:text-accent/80 transition-colors font-semibold"
                >
                  Use in Designer
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="glass rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to create?</h2>
          <p className="text-muted-foreground mb-6">
            Start designing your custom piece with our sticker packs and limited-edition drops.
          </p>
          <Link
            href="/design"
            className="inline-block px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Open Design Studio
          </Link>
        </div>
      </div>
    </div>
  )
}
