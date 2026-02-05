import mongoose from 'mongoose'

const stickerSchema = new mongoose.Schema({
  name: String,
  image: String,
  theme: { type: String, enum: ["street", "minimal", "anime", "abstract", "typography"], default: "street" },
  isPremium: { type: Boolean, default: false },
  isLimitedEdition: { type: Boolean, default: false },
  dropDate: Date,
  price: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model("Sticker", stickerSchema)
