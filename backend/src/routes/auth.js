import { Hono } from 'hono'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const app = new Hono()

// Register
app.post('/register', async (c) => {
  try {
    const { name, email, password } = await c.req.json()

    if (!name || !email || !password) {
      return c.json({ message: 'Name, email, and password are required' }, 400)
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return c.json({ message: 'Invalid email format' }, 400)
    }

    if (password.length < 6) {
      return c.json({ message: 'Password must be at least 6 characters' }, 400)
    }

    let user = await User.findOne({ email })
    if (user) {
      return c.json({ message: 'User already exists' }, 400)
    }

    user = new User({ name, email, password })
    await user.save()

    const token = jwt.sign({ userId: user._id }, c.env.JWT_SECRET, { expiresIn: '7d' })

    return c.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Login
app.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    const user = await User.findOne({ email })
    if (!user) {
      return c.json({ message: 'Invalid credentials' }, 400)
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return c.json({ message: 'Invalid credentials' }, 400)
    }

    const token = jwt.sign({ userId: user._id }, c.env.JWT_SECRET, { expiresIn: '7d' })

    return c.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

export default app
