import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import mongoose from 'mongoose'

// Import routes
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import designRoutes from './routes/designs.js'
import orderRoutes from './routes/orders.js'
import productRoutes from './routes/products.js'
import stickerRoutes from './routes/stickers.js'
import cartRoutes from './routes/cart.js'
import adminRoutes from './routes/admin.js'

const app = new Hono()

// Store MongoDB connection promise
let mongoConnection = null

// Middleware to connect to MongoDB
const connectDB = async (env) => {
  if (mongoose.connection.readyState === 1) return
  if (mongoConnection) return mongoConnection

  mongoConnection = mongoose.connect(env.MONGODB_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })

  await mongoConnection
  console.log('MongoDB connected')
}

// CORS configuration
app.use('*', cors({
  origin: (origin, c) => {
    const allowedOrigins = [
      c.env.FRONTEND_URL,
      'http://localhost:3000',
      'https://trapo-three.vercel.app',
      'https://admin-trapo.vercel.app'
    ]
    if (!origin || allowedOrigins.includes(origin)) {
      return origin || '*'
    }
    return null
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Security headers
app.use('*', secureHeaders())

// Logger
app.use('*', logger())

// Connect to DB for all API routes
app.use('/api/*', async (c, next) => {
  try {
    await connectDB(c.env)
    // Pass env to context for routes
    c.set('env', c.env)
    await next()
  } catch (error) {
    console.error('DB Connection error:', error)
    return c.json({ message: 'Database connection failed' }, 500)
  }
})

// Health check
app.get('/api/health', (c) => {
  return c.json({ status: 'Backend is running', platform: 'Cloudflare Workers' })
})

// Mount routes
app.route('/api/auth', authRoutes)
app.route('/api/users', userRoutes)
app.route('/api/designs', designRoutes)
app.route('/api/orders', orderRoutes)
app.route('/api/products', productRoutes)
app.route('/api/stickers', stickerRoutes)
app.route('/api/cart', cartRoutes)
app.route('/api/admin', adminRoutes)

// 404 handler
app.notFound((c) => {
  return c.json({ message: 'Not found' }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('Error:', err)
  return c.json({ message: err.message || 'Internal server error' }, 500)
})

export default app
