const express = require("express")
const jwt = require("jsonwebtoken")
const adminAuth = require("../middleware/admin")
const User = require("../models/User")
const Order = require("../models/Order")
const Product = require("../models/Product")
const Sticker = require("../models/Sticker")
const Design = require("../models/Design")

const router = express.Router()

// Admin registration (requires ADMIN_CREATION_SECRET for security)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body

    // Require admin creation secret for security
    const requiredSecret = process.env.ADMIN_CREATION_SECRET
    if (!requiredSecret) {
      return res.status(403).json({ message: "Admin registration is disabled" })
    }
    if (adminSecret !== requiredSecret) {
      return res.status(403).json({ message: "Invalid admin creation secret" })
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" })
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" })
    }

    // Check if user with this email exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" })
    }

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" })
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" })
    }

    const admin = new User({
      name,
      email,
      password,
      role: "admin"
    })
    await admin.save()

    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      message: "Admin created successfully",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const admin = await User.findOne({ email, role: "admin" })
    if (!admin) {
      return res.status(400).json({ message: "Invalid admin credentials" })
    }

    const isMatch = await admin.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid admin credentials" })
    }

    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      message: "Admin login successful",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all orders (admin only, with pagination)
router.get("/orders", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const status = req.query.status

    const query = status ? { status } : {}

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
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

// Update order status (admin only)
router.put("/orders/:id/status", adminAuth, async (req, res) => {
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

// Get all users (admin only, with pagination)
router.get("/users", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      User.find({ role: "user" })
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments({ role: "user" })
    ])

    res.json({
      users,
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

// Get admin dashboard stats
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts, totalStickers, totalDesigns] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Order.countDocuments(),
      Product.countDocuments(),
      Sticker.countDocuments(),
      Design.countDocuments()
    ])

    const recentOrders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(5)

    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ])

    // Revenue stats
    const revenueStats = await Order.aggregate([
      { $match: { status: { $in: ["ordered", "shipped", "completed"] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$total" },
          avgOrderValue: { $avg: "$total" }
        }
      }
    ])

    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalStickers,
      totalDesigns,
      recentOrders,
      orderStats,
      revenue: revenueStats[0] || { totalRevenue: 0, avgOrderValue: 0 }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ==================== STICKER MANAGEMENT ====================

// Get all stickers (admin only, with pagination)
router.get("/stickers", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    const theme = req.query.theme

    const query = theme ? { theme } : {}

    const [stickers, total] = await Promise.all([
      Sticker.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Sticker.countDocuments(query)
    ])

    res.json({
      stickers,
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

// Create sticker (admin only)
router.post("/stickers", adminAuth, async (req, res) => {
  try {
    const { name, image, theme, isPremium, isLimitedEdition, dropDate, price } = req.body

    if (!name || !image || !theme) {
      return res.status(400).json({ message: "Name, image, and theme are required" })
    }

    const validThemes = ["street", "minimal", "anime", "abstract", "typography"]
    if (!validThemes.includes(theme)) {
      return res.status(400).json({ message: `Theme must be one of: ${validThemes.join(", ")}` })
    }

    const sticker = new Sticker({
      name,
      image,
      theme,
      isPremium: isPremium || false,
      isLimitedEdition: isLimitedEdition || false,
      dropDate: dropDate || null,
      price: price || 0
    })

    await sticker.save()
    res.status(201).json(sticker)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update sticker (admin only)
router.put("/stickers/:id", adminAuth, async (req, res) => {
  try {
    const { name, image, theme, isPremium, isLimitedEdition, dropDate, price } = req.body

    const sticker = await Sticker.findById(req.params.id)
    if (!sticker) {
      return res.status(404).json({ message: "Sticker not found" })
    }

    if (name) sticker.name = name
    if (image) sticker.image = image
    if (theme) {
      const validThemes = ["street", "minimal", "anime", "abstract", "typography"]
      if (!validThemes.includes(theme)) {
        return res.status(400).json({ message: `Theme must be one of: ${validThemes.join(", ")}` })
      }
      sticker.theme = theme
    }
    if (typeof isPremium === "boolean") sticker.isPremium = isPremium
    if (typeof isLimitedEdition === "boolean") sticker.isLimitedEdition = isLimitedEdition
    if (dropDate !== undefined) sticker.dropDate = dropDate
    if (price !== undefined) sticker.price = price

    await sticker.save()
    res.json(sticker)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete sticker (admin only)
router.delete("/stickers/:id", adminAuth, async (req, res) => {
  try {
    const sticker = await Sticker.findByIdAndDelete(req.params.id)
    if (!sticker) {
      return res.status(404).json({ message: "Sticker not found" })
    }
    res.json({ message: "Sticker deleted successfully", sticker })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ==================== DESIGNS MANAGEMENT ====================

// Get all designs (admin only, with pagination)
router.get("/designs", adminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [designs, total] = await Promise.all([
      Design.find()
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Design.countDocuments()
    ])

    res.json({
      designs,
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

module.exports = router
