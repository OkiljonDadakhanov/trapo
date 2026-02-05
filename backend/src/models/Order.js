import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderNumber: { type: String, unique: true, required: true },
  items: [{
    type: { type: String, enum: ["design", "product", "custom"], required: true },
    designId: mongoose.Schema.Types.ObjectId,
    productId: mongoose.Schema.Types.ObjectId,
    customId: String,
    quantity: Number,
    price: Number,
    name: String,
  }],
  customerInfo: {
    name: String, email: String, phone: String, address: String,
    city: String, state: String, zipCode: String, country: String,
  },
  subtotal: Number,
  shipping: Number,
  tax: Number,
  total: Number,
  status: { type: String, enum: ["ordered", "shipped", "completed"], default: "ordered" },
  statusHistory: [{ status: String, updatedAt: { type: Date, default: Date.now }, note: String }],
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model("Order", orderSchema)
