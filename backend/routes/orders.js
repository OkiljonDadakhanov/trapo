const express = require("express")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/admin")
const Order = require("../models/Order")
const { orderValidation, mongoIdValidation } = require("../middleware/validate")

const router = express.Router()

// Create order
router.post("/", auth, orderValidation, async (req, res) => {
  try {
    const orderNumber = "ORD-" + Date.now()
    
    // Validate items
    if (req.body.items && Array.isArray(req.body.items)) {
      for (let item of req.body.items) {
        if (item.type === 'custom') {
          // Custom items uchun productId ni customId ga o'tkazamiz
          if (item.productId && item.productId.startsWith('custom-')) {
            item.customId = item.productId
            delete item.productId
          }
          // Also handle if customId is already set
          if (!item.customId && item.id) {
            item.customId = item.id
          }
        }
      }
    }
    
    // Build order data with required fields
    const orderData = {
      userId: req.userId,
      orderNumber,
      items: req.body.items || [],
      customerInfo: req.body.customerInfo || {},
      subtotal: req.body.subtotal || 0,
      shipping: req.body.shipping || 0,
      tax: req.body.tax || 0,
      total: req.body.total || 0,
      status: "ordered",
      statusHistory: [
        {
          status: "ordered",
          note: "Order placed",
          updatedAt: new Date(),
        },
      ],
    }
    
    const order = new Order(orderData)
    await order.save()
    res.status(201).json(order)
  } catch (error) {
    console.error("Order creation error:", error)
    res.status(500).json({ message: error.message || "Failed to create order" })
  }
})

// Get user's orders (with pagination)
router.get("/", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      Order.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ userId: req.userId })
    ])

    res.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single order
router.get("/:id", auth, mongoIdValidation, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }
    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update order status (admin only)
router.put("/:id/status", adminAuth, mongoIdValidation, async (req, res) => {
  try {
    const { status, note } = req.body
    
    if (!["ordered", "shipped", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    order.status = status
    order.statusHistory.push({
      status,
      note: note || `Status updated to ${status}`,
    })

    await order.save()
    res.json(order)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
