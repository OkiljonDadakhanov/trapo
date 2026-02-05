import { Hono } from 'hono'
import { auth, adminAuth } from '../middleware/auth.js'
import Order from '../models/Order.js'

const app = new Hono()

// Create order
app.post('/', auth, async (c) => {
  try {
    const body = await c.req.json()
    const orderNumber = 'ORD-' + Date.now()

    if (body.items && Array.isArray(body.items)) {
      for (let item of body.items) {
        if (item.type === 'custom') {
          if (item.productId && item.productId.startsWith('custom-')) {
            item.customId = item.productId
            delete item.productId
          }
          if (!item.customId && item.id) {
            item.customId = item.id
          }
        }
      }
    }

    const orderData = {
      userId: c.get('userId'),
      orderNumber,
      items: body.items || [],
      customerInfo: body.customerInfo || {},
      subtotal: body.subtotal || 0,
      shipping: body.shipping || 0,
      tax: body.tax || 0,
      total: body.total || 0,
      status: 'ordered',
      statusHistory: [{ status: 'ordered', note: 'Order placed', updatedAt: new Date() }],
    }

    const order = new Order(orderData)
    await order.save()
    return c.json(order, 201)
  } catch (error) {
    return c.json({ message: error.message || 'Failed to create order' }, 500)
  }
})

// Get user's orders (with pagination)
app.get('/', auth, async (c) => {
  try {
    const page = parseInt(c.req.query('page')) || 1
    const limit = parseInt(c.req.query('limit')) || 10
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      Order.find({ userId: c.get('userId') }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ userId: c.get('userId') })
    ])

    return c.json({ orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Get single order
app.get('/:id', auth, async (c) => {
  try {
    const order = await Order.findById(c.req.param('id'))
    if (!order) return c.json({ message: 'Order not found' }, 404)
    return c.json(order)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Update order status (admin only)
app.put('/:id/status', adminAuth, async (c) => {
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

export default app
