const express = require("express")
const Product = require("../models/Product")
const adminAuth = require("../middleware/admin")
const { productValidation, mongoIdValidation } = require("../middleware/validate")

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
router.get("/:id", mongoIdValidation, async (req, res) => {
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

// Create new product (admin only)
router.post("/", adminAuth, productValidation, async (req, res) => {
  try {
    const { name, category, price, stock, description, image, colors, sizes } = req.body

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

// Update product (admin only)
router.put("/:id", adminAuth, mongoIdValidation, async (req, res) => {
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

// Delete product (admin only)
router.delete("/:id", adminAuth, mongoIdValidation, async (req, res) => {
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
