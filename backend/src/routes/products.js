import { Hono } from 'hono'
import { adminAuth } from '../middleware/auth.js'
import Product from '../models/Product.js'

const app = new Hono()

// Get all products
app.get('/', async (c) => {
  try {
    const products = await Product.find()
    return c.json(products)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Get single product
app.get('/:id', async (c) => {
  try {
    const product = await Product.findById(c.req.param('id'))
    if (!product) return c.json({ message: 'Product not found' }, 404)
    return c.json(product)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Create product (admin only)
app.post('/', adminAuth, async (c) => {
  try {
    const { name, category, price, stock, description, image, colors, sizes } = await c.req.json()

    if (!name || !category || !price || stock === undefined) {
      return c.json({ message: 'Name, category, price, and stock are required' }, 400)
    }

    const product = new Product({
      name, category, price, stock,
      description: description || '',
      image: image || '',
      colors: colors || [],
      sizes: sizes || [],
      inStock: stock > 0,
    })

    await product.save()
    return c.json(product, 201)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Update product (admin only)
app.put('/:id', adminAuth, async (c) => {
  try {
    const { name, category, price, stock, description, image, colors, sizes } = await c.req.json()
    const product = await Product.findById(c.req.param('id'))
    if (!product) return c.json({ message: 'Product not found' }, 404)

    if (name) product.name = name
    if (category) product.category = category
    if (price !== undefined) product.price = price
    if (stock !== undefined) { product.stock = stock; product.inStock = stock > 0 }
    if (description !== undefined) product.description = description
    if (image !== undefined) product.image = image
    if (colors) product.colors = colors
    if (sizes) product.sizes = sizes

    await product.save()
    return c.json(product)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Delete product (admin only)
app.delete('/:id', adminAuth, async (c) => {
  try {
    const product = await Product.findByIdAndDelete(c.req.param('id'))
    if (!product) return c.json({ message: 'Product not found' }, 404)
    return c.json({ message: 'Product deleted successfully', product })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

export default app
