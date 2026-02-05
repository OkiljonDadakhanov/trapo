import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  image: String,
  colors: [String],
  sizes: [String],
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model("Product", productSchema)
