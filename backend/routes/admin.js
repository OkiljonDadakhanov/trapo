const express = require("express")
const jwt = require("jsonwebtoken")
const adminAuth = require("../middleware/admin")
const User = require("../models/User")
const Order = require("../models/Order")
const Product = require("../models/Product")

const router = express.Router()

// Admin registration (only for initial setup)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

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

    const admin = new User({ 
      name, 
      email, 
      password, 
      role: "admin" 
    })
    await admin.save()

    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" })

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

    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" })

    res.json({
      message: "Admin login successful",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get all orders (admin only)
router.get("/orders", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
    res.json(orders)
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

// Get all users (admin only)
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get admin dashboard stats
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" })
    const totalOrders = await Order.countDocuments()
    const totalProducts = await Product.countDocuments()
    
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

    res.json({
      totalUsers,
      totalOrders,
      totalProducts,
      recentOrders,
      orderStats
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
