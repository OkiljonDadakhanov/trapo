const mongoose = require("mongoose")
const Product = require("../models/Product")
require("dotenv").config()

const sampleProducts = [
  {
    name: "Classic Vinyl Sticker",
    description: "High-quality vinyl sticker perfect for laptops, phones, and any smooth surface",
    category: "Stickers",
    price: 5.99,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    colors: ["Black", "White", "Red", "Blue", "Green"],
    sizes: ["Small (2x2)", "Medium (3x3)", "Large (4x4)"],
    inStock: true
  },
  {
    name: "Custom Logo Sticker",
    description: "Personalized logo sticker with your custom design",
    category: "Custom",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400",
    colors: ["Black", "White", "Transparent"],
    sizes: ["Small (1x1)", "Medium (2x2)", "Large (3x3)", "XL (4x4)"],
    inStock: true
  },
  {
    name: "Car Decal Sticker",
    description: "Weather-resistant car decal perfect for vehicle customization",
    category: "Automotive",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400",
    colors: ["Black", "White", "Chrome", "Reflective"],
    sizes: ["Small (6x2)", "Medium (8x3)", "Large (12x4)"],
    inStock: true
  },
  {
    name: "Laptop Skin Sticker",
    description: "Full laptop skin sticker for complete laptop customization",
    category: "Electronics",
    price: 19.99,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
    colors: ["Black", "White", "Wood", "Carbon Fiber"],
    sizes: ["13 inch", "15 inch", "17 inch"],
    inStock: true
  },
  {
    name: "Phone Case Sticker",
    description: "Precision-cut sticker designed specifically for phone cases",
    category: "Mobile",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
    colors: ["Black", "White", "Transparent", "Glow-in-Dark"],
    sizes: ["iPhone 12/13", "iPhone 14/15", "Samsung Galaxy", "Google Pixel"],
    inStock: true
  },
  {
    name: "Waterproof Sticker",
    description: "Heavy-duty waterproof sticker for outdoor use",
    category: "Outdoor",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
    colors: ["Black", "White", "Yellow", "Orange"],
    sizes: ["Small (2x2)", "Medium (3x3)", "Large (4x4)"],
    inStock: true
  },
  {
    name: "Glow in the Dark Sticker",
    description: "Fun glow-in-the-dark sticker that lights up at night",
    category: "Fun",
    price: 6.99,
    image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400",
    colors: ["Green", "Blue", "Purple", "Pink"],
    sizes: ["Small (2x2)", "Medium (3x3)", "Large (4x4)"],
    inStock: true
  },
  {
    name: "Holographic Sticker",
    description: "Eye-catching holographic sticker with rainbow effects",
    category: "Premium",
    price: 11.99,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    colors: ["Holographic", "Rainbow", "Iridescent"],
    sizes: ["Small (2x2)", "Medium (3x3)", "Large (4x4)"],
    inStock: true
  }
]

async function seedProducts() {
  try {
    // MongoDB ga ulanish
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/trapo")
    console.log("MongoDB ga ulandi")

    // Mavjud mahsulotlarni o'chirish
    await Product.deleteMany({})
    console.log("Mavjud mahsulotlar o'chirildi")

    // Yangi mahsulotlarni qo'shish
    const products = await Product.insertMany(sampleProducts)
    console.log(`${products.length} ta mahsulot qo'shildi`)

    // Ulanishni yopish
    await mongoose.connection.close()
    console.log("Ma'lumotlar bazasi ulanishi yopildi")
  } catch (error) {
    console.error("Xatolik:", error)
    process.exit(1)
  }
}

seedProducts()
