const express = require("express")
const auth = require("../middleware/auth")
const Cart = require("../models/Cart")
const { body, validationResult } = require("express-validator")

const router = express.Router()

// Validation for cart items
const cartItemValidation = [
  body("type").isIn(["product", "design", "custom"]).withMessage("Invalid item type"),
  body("name").trim().notEmpty().withMessage("Item name is required"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be positive"),
  body("quantity").optional().isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
]

// Get user's cart
router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.userId })

    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] })
      await cart.save()
    }

    res.json(cart)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Add item to cart
router.post("/items", auth, cartItemValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() })
  }

  try {
    let cart = await Cart.findOne({ userId: req.userId })

    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] })
    }

    const { type, productId, designId, customId, name, price, quantity = 1, customDesign, image } = req.body

    // Check if item already exists (for products and designs)
    const existingIndex = cart.items.findIndex(item => {
      if (type === "product" && productId) return item.productId?.toString() === productId
      if (type === "design" && designId) return item.designId?.toString() === designId
      if (type === "custom" && customId) return item.customId === customId
      return false
    })

    if (existingIndex > -1) {
      // Update quantity if item exists
      cart.items[existingIndex].quantity += quantity
    } else {
      // Add new item
      cart.items.push({
        type,
        productId: type === "product" ? productId : undefined,
        designId: type === "design" ? designId : undefined,
        customId: type === "custom" ? customId : undefined,
        name,
        price,
        quantity,
        customDesign,
        image,
      })
    }

    await cart.save()
    res.json(cart)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update cart item quantity
router.put("/items/:itemId", auth, async (req, res) => {
  try {
    const { quantity } = req.body

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" })
    }

    const cart = await Cart.findOne({ userId: req.userId })

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    const item = cart.items.id(req.params.itemId)

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" })
    }

    item.quantity = quantity
    await cart.save()

    res.json(cart)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Remove item from cart
router.delete("/items/:itemId", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId })

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId)
    await cart.save()

    res.json(cart)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Clear entire cart
router.delete("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId })

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" })
    }

    cart.items = []
    await cart.save()

    res.json({ message: "Cart cleared", cart })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Sync cart (replace entire cart - useful for merging localStorage cart)
router.put("/sync", auth, async (req, res) => {
  try {
    const { items } = req.body

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Items must be an array" })
    }

    let cart = await Cart.findOne({ userId: req.userId })

    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [] })
    }

    // Replace items
    cart.items = items.map(item => ({
      type: item.type || "custom",
      productId: item.productId,
      designId: item.designId,
      customId: item.customId || item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      customDesign: item.customDesign,
      image: item.image,
    }))

    await cart.save()
    res.json(cart)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
