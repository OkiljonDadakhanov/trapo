const express = require("express")
const Product = require("../models/Product")

const router = express.Router()

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Create new product
router.post("/", async (req, res) => {
  try {
    const { name, category, price, stock, description, image, colors, sizes } = req.body

    // Validate required fields
    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({ message: "Name, category, price, and stock are required" })
    }

    const product = new Product({
      name,
      category,
      price,
      stock,
      description: description || "",
      image: image || "",
      colors: colors || [],
      sizes: sizes || [],
      inStock: stock > 0,
    })

    await product.save()
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update product
router.put("/:id", async (req, res) => {
  try {
    const { name, category, price, stock, description, image, colors, sizes } = req.body

    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    // Update fields if provided
    if (name) product.name = name
    if (category) product.category = category
    if (price !== undefined) product.price = price
    if (stock !== undefined) {
      product.stock = stock
      product.inStock = stock > 0
    }
    if (description !== undefined) product.description = description
    if (image !== undefined) product.image = image
    if (colors) product.colors = colors
    if (sizes) product.sizes = sizes

    await product.save()
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }
    res.json({ message: "Product deleted successfully", product })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
