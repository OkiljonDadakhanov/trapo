const mongoose = require("mongoose")

const designSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    default: "My Design",
  },
  productType: {
    type: String,
    enum: ["t-shirt", "hoodie", "jacket"],
    default: "t-shirt",
  },
  color: {
    type: String,
    default: "#000000",
  },
  size: {
    type: String,
    enum: ["XS", "S", "M", "L", "XL", "XXL"],
    default: "M",
  },
  stickers: [
    {
      id: String,
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      rotation: Number,
      surface: {
        type: String,
        enum: ["front", "back", "sleeve"],
        default: "front",
      },
      zIndex: Number,
    },
  ],
  customImages: [
    {
      url: String,
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      rotation: Number,
      surface: {
        type: String,
        enum: ["front", "back", "sleeve"],
        default: "front",
      },
      zIndex: Number,
    },
  ],
  price: {
    type: Number,
    default: 49.99,
  },
  previewImage: String,
  shareLink: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Design", designSchema)
