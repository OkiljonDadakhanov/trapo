const mongoose = require("mongoose")
const dotenv = require("dotenv")

dotenv.config()

const Product = require("../models/Product")
const Sticker = require("../models/Sticker")

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/trapo")
    console.log("Connected to MongoDB")

    // Clear existing data
    await Product.deleteMany({})
    await Sticker.deleteMany({})

    // Seed Products
    const products = [
      {
        name: "Classic Hoodie",
        description: "Premium quality hoodie perfect for customization",
        category: "hoodies",
        price: 89.99,
        image: "/cozy-hoodie.png",
        colors: ["Black", "White", "Navy", "Gray"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        inStock: true,
      },
      {
        name: "Premium T-Shirt",
        description: "Comfortable cotton t-shirt for your designs",
        category: "tshirts",
        price: 49.99,
        image: "/plain-white-tshirt.png",
        colors: ["Black", "White", "Red", "Navy"],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        inStock: true,
      },
      {
        name: "Streetwear Jacket",
        description: "Bold jacket for statement designs",
        category: "jackets",
        price: 129.99,
        image: "/stylish-woman-leather-jacket.png",
        colors: ["Black", "Navy", "Gray"],
        sizes: ["S", "M", "L", "XL", "XXL"],
        inStock: true,
      },
      {
        name: "Sweatshirt",
        description: "Cozy sweatshirt for casual wear",
        category: "sweatshirts",
        price: 79.99,
        image: "/cozy-sweatshirt.png",
        colors: ["Black", "White", "Gray", "Purple"],
        sizes: ["XS", "S", "M", "L", "XL"],
        inStock: true,
      },
      {
        name: "Baseball Cap",
        description: "Classic cap for your designs",
        category: "caps",
        price: 39.99,
        image: "/baseball-cap-display.png",
        colors: ["Black", "White", "Navy"],
        sizes: ["One Size"],
        inStock: true,
      },
    ]

    await Product.insertMany(products)
    console.log("Products seeded successfully")

    // Seed Stickers
    const stickers = [
      // Street Theme
      { name: "Skull", theme: "street", isPremium: false, isLimitedEdition: false, price: 0 },
      { name: "Lightning", theme: "street", isPremium: false, isLimitedEdition: false, price: 0 },
      { name: "Fire", theme: "street", isPremium: true, isLimitedEdition: false, price: 5 },
      { name: "Crown", theme: "street", isPremium: false, isLimitedEdition: false, price: 0 },

      // Minimal Theme
      { name: "Star", theme: "minimal", isPremium: false, isLimitedEdition: false, price: 0 },
      { name: "Heart", theme: "minimal", isPremium: false, isLimitedEdition: false, price: 0 },
      { name: "Diamond", theme: "minimal", isPremium: true, isLimitedEdition: false, price: 5 },
      { name: "Moon", theme: "minimal", isPremium: false, isLimitedEdition: false, price: 0 },

      // Anime Theme
      { name: "Torii Gate", theme: "anime", isPremium: true, isLimitedEdition: true, price: 8, dropDate: new Date() },
      { name: "Flag", theme: "anime", isPremium: false, isLimitedEdition: false, price: 0 },

      // Abstract Theme
      { name: "Sparkle", theme: "abstract", isPremium: false, isLimitedEdition: false, price: 0 },
      { name: "Swirl", theme: "abstract", isPremium: true, isLimitedEdition: false, price: 5 },

      // Typography Theme
      { name: "Bold Text", theme: "typography", isPremium: false, isLimitedEdition: false, price: 0 },
      { name: "Script", theme: "typography", isPremium: true, isLimitedEdition: false, price: 5 },
    ]

    await Sticker.insertMany(stickers)
    console.log("Stickers seeded successfully")

    console.log("Database seeded successfully!")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
