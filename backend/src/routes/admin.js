import { Hono } from 'hono'
import jwt from 'jsonwebtoken'
import { adminAuth } from '../middleware/auth.js'
import User from '../models/User.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Sticker from '../models/Sticker.js'
import Design from '../models/Design.js'

const app = new Hono()

// Admin registration
app.post('/register', async (c) => {
  try {
    const { name, email, password, adminSecret } = await c.req.json()

    const requiredSecret = c.env.ADMIN_CREATION_SECRET
    if (!requiredSecret) {
      return c.json({ message: 'Admin registration is disabled' }, 403)
    }
    if (adminSecret !== requiredSecret) {
      return c.json({ message: 'Invalid admin creation secret' }, 403)
    }

    const existingAdmin = await User.findOne({ role: 'admin' })
    if (existingAdmin) {
      return c.json({ message: 'Admin already exists' }, 400)
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return c.json({ message: 'User with this email already exists' }, 400)
    }

    if (!name || !email || !password) {
      return c.json({ message: 'Name, email, and password are required' }, 400)
    }

    if (password.length < 8) {
      return c.json({ message: 'Password must be at least 8 characters' }, 400)
    }

    const admin = new User({ name, email, password, role: 'admin' })
    await admin.save()

    const token = jwt.sign({ userId: admin._id }, c.env.JWT_SECRET, { expiresIn: '7d' })

    return c.json({
      message: 'Admin created successfully',
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    }, 201)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Admin login
app.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    const admin = await User.findOne({ email, role: 'admin' })
    if (!admin) {
      return c.json({ message: 'Invalid admin credentials' }, 400)
    }

    const isMatch = await admin.comparePassword(password)
    if (!isMatch) {
      return c.json({ message: 'Invalid admin credentials' }, 400)
    }

    const token = jwt.sign({ userId: admin._id }, c.env.JWT_SECRET, { expiresIn: '7d' })

    return c.json({
      message: 'Admin login successful',
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Get dashboard stats
app.get('/dashboard', adminAuth, async (c) => {
  try {
    const [totalUsers, totalOrders, totalProducts, totalStickers, totalDesigns] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Product.countDocuments(),
      Sticker.countDocuments(),
      Design.countDocuments()
    ])

    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)

    const orderStats = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ])

    const revenueStats = await Order.aggregate([
      { $match: { status: { $in: ['ordered', 'shipped', 'completed'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, avgOrderValue: { $avg: '$total' } } }
    ])

    return c.json({
      totalUsers, totalOrders, totalProducts, totalStickers, totalDesigns,
      recentOrders, orderStats,
      revenue: revenueStats[0] || { totalRevenue: 0, avgOrderValue: 0 }
    })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Get all orders (with pagination)
app.get('/orders', adminAuth, async (c) => {
  try {
    const page = parseInt(c.req.query('page')) || 1
    const limit = parseInt(c.req.query('limit')) || 10
    const skip = (page - 1) * limit
    const status = c.req.query('status')

    const query = status ? { status } : {}

    const [orders, total] = await Promise.all([
      Order.find(query).populate('userId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query)
    ])

    return c.json({ orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Update order status
app.put('/orders/:id/status', adminAuth, async (c) => {
  try {
    const { status, note } = await c.req.json()

    if (!['ordered', 'shipped', 'completed'].includes(status)) {
      return c.json({ message: 'Invalid status' }, 400)
    }

    const order = await Order.findById(c.req.param('id'))
    if (!order) return c.json({ message: 'Order not found' }, 404)

    order.status = status
    order.statusHistory.push({ status, note: note || `Status updated to ${status}` })
    await order.save()

    return c.json(order)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Get all users (with pagination)
app.get('/users', adminAuth, async (c) => {
  try {
    const page = parseInt(c.req.query('page')) || 1
    const limit = parseInt(c.req.query('limit')) || 10
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments({ role: 'user' })
    ])

    return c.json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Get all stickers (with pagination)
app.get('/stickers', adminAuth, async (c) => {
  try {
    const page = parseInt(c.req.query('page')) || 1
    const limit = parseInt(c.req.query('limit')) || 20
    const skip = (page - 1) * limit
    const theme = c.req.query('theme')

    const query = theme ? { theme } : {}

    const [stickers, total] = await Promise.all([
      Sticker.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Sticker.countDocuments(query)
    ])

    return c.json({ stickers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Create sticker
app.post('/stickers', adminAuth, async (c) => {
  try {
    const { name, image, theme, isPremium, isLimitedEdition, dropDate, price } = await c.req.json()

    if (!name || !image || !theme) {
      return c.json({ message: 'Name, image, and theme are required' }, 400)
    }

    const validThemes = ['street', 'minimal', 'anime', 'abstract', 'typography']
    if (!validThemes.includes(theme)) {
      return c.json({ message: `Theme must be one of: ${validThemes.join(', ')}` }, 400)
    }

    const sticker = new Sticker({
      name, image, theme,
      isPremium: isPremium || false,
      isLimitedEdition: isLimitedEdition || false,
      dropDate: dropDate || null,
      price: price || 0
    })

    await sticker.save()
    return c.json(sticker, 201)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Update sticker
app.put('/stickers/:id', adminAuth, async (c) => {
  try {
    const { name, image, theme, isPremium, isLimitedEdition, dropDate, price } = await c.req.json()
    const sticker = await Sticker.findById(c.req.param('id'))
    if (!sticker) return c.json({ message: 'Sticker not found' }, 404)

    if (name) sticker.name = name
    if (image) sticker.image = image
    if (theme) {
      const validThemes = ['street', 'minimal', 'anime', 'abstract', 'typography']
      if (!validThemes.includes(theme)) {
        return c.json({ message: `Theme must be one of: ${validThemes.join(', ')}` }, 400)
      }
      sticker.theme = theme
    }
    if (typeof isPremium === 'boolean') sticker.isPremium = isPremium
    if (typeof isLimitedEdition === 'boolean') sticker.isLimitedEdition = isLimitedEdition
    if (dropDate !== undefined) sticker.dropDate = dropDate
    if (price !== undefined) sticker.price = price

    await sticker.save()
    return c.json(sticker)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Delete sticker
app.delete('/stickers/:id', adminAuth, async (c) => {
  try {
    const sticker = await Sticker.findByIdAndDelete(c.req.param('id'))
    if (!sticker) return c.json({ message: 'Sticker not found' }, 404)
    return c.json({ message: 'Sticker deleted successfully', sticker })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Get all designs (with pagination)
app.get('/designs', adminAuth, async (c) => {
  try {
    const page = parseInt(c.req.query('page')) || 1
    const limit = parseInt(c.req.query('limit')) || 10
    const skip = (page - 1) * limit

    const [designs, total] = await Promise.all([
      Design.find().populate('userId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Design.countDocuments()
    ])

    return c.json({ designs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

export default app
