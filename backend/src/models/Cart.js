import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  designId: { type: mongoose.Schema.Types.ObjectId, ref: "Design" },
  customId: String,
  type: { type: String, enum: ["product", "design", "custom"], required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  customDesign: { color: String, size: String, surface: String, stickers: [{ id: String, x: Number, y: Number, scale: Number, rotation: Number }] },
  image: String,
})

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  items: [cartItemSchema],
  updatedAt: { type: Date, default: Date.now },
})

cartSchema.pre("save", function(next) { this.updatedAt = new Date(); next() })
cartSchema.virtual("total").get(function() { return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) })
cartSchema.set("toJSON", { virtuals: true })

export default mongoose.model("Cart", cartSchema)
