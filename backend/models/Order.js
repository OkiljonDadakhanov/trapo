const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  items: [
    {
      type: {
        type: String,
        enum: ["design", "product", "custom"],
        required: true,
      },
      designId: {
        type: mongoose.Schema.Types.ObjectId,
        required: function() {
          return this.type === 'design';
        }
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: function() {
          return this.type === 'product';
        }
      },
      customId: {
        type: String,
        required: function() {
          return this.type === 'custom';
        }
      },
      quantity: Number,
      price: Number,
      name: String,
    },
  ],
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  subtotal: Number,
  shipping: Number,
  tax: Number,
  total: Number,
  status: {
    type: String,
    enum: ["ordered", "shipped", "completed"],
    default: "ordered",
  },
  statusHistory: [
    {
      status: {
        type: String,
        enum: ["ordered", "shipped", "completed"],
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      note: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Order", orderSchema)
