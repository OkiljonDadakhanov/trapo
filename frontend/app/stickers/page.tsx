"use client"

import { Navbar } from "@/components/navbar"
import { StickerGallery } from "@/components/sticker-gallery"

export default function StickersPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <StickerGallery />
    </main>
  )
}
