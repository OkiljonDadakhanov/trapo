import { Hono } from 'hono'
import { auth } from '../middleware/auth.js'
import Cart from '../models/Cart.js'

const app = new Hono()

app.use('*', auth)

// Get user's cart
app.get('/', async (c) => {
  try {
    let cart = await Cart.findOne({ userId: c.get('userId') })
    if (!cart) {
      cart = new Cart({ userId: c.get('userId'), items: [] })
      await cart.save()
    }
    return c.json(cart)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Add item to cart
app.post('/items', async (c) => {
  try {
    let cart = await Cart.findOne({ userId: c.get('userId') })
    if (!cart) {
      cart = new Cart({ userId: c.get('userId'), items: [] })
    }

    const { type, productId, designId, customId, name, price, quantity = 1, customDesign, image } = await c.req.json()

    const existingIndex = cart.items.findIndex(item => {
      if (type === 'product' && productId) return item.productId?.toString() === productId
      if (type === 'design' && designId) return item.designId?.toString() === designId
      if (type === 'custom' && customId) return item.customId === customId
      return false
    })

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity
    } else {
      cart.items.push({
        type,
        productId: type === 'product' ? productId : undefined,
        designId: type === 'design' ? designId : undefined,
        customId: type === 'custom' ? customId : undefined,
        name, price, quantity, customDesign, image,
      })
    }

    await cart.save()
    return c.json(cart)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Update cart item quantity
app.put('/items/:itemId', async (c) => {
  try {
    const { quantity } = await c.req.json()
    if (!quantity || quantity < 1) {
      return c.json({ message: 'Quantity must be at least 1' }, 400)
    }

    const cart = await Cart.findOne({ userId: c.get('userId') })
    if (!cart) return c.json({ message: 'Cart not found' }, 404)

    const item = cart.items.id(c.req.param('itemId'))
    if (!item) return c.json({ message: 'Item not found in cart' }, 404)

    item.quantity = quantity
    await cart.save()
    return c.json(cart)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Remove item from cart
app.delete('/items/:itemId', async (c) => {
  try {
    const cart = await Cart.findOne({ userId: c.get('userId') })
    if (!cart) return c.json({ message: 'Cart not found' }, 404)

    cart.items = cart.items.filter(item => item._id.toString() !== c.req.param('itemId'))
    await cart.save()
    return c.json(cart)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Clear cart
app.delete('/', async (c) => {
  try {
    const cart = await Cart.findOne({ userId: c.get('userId') })
    if (!cart) return c.json({ message: 'Cart not found' }, 404)

    cart.items = []
    await cart.save()
    return c.json({ message: 'Cart cleared', cart })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Sync cart
app.put('/sync', async (c) => {
  try {
    const { items } = await c.req.json()
    if (!Array.isArray(items)) {
      return c.json({ message: 'Items must be an array' }, 400)
    }

    let cart = await Cart.findOne({ userId: c.get('userId') })
    if (!cart) {
      cart = new Cart({ userId: c.get('userId'), items: [] })
    }

    cart.items = items.map(item => ({
      type: item.type || 'custom',
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
    return c.json(cart)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

export default app
