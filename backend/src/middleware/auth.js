import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const auth = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return c.json({ message: 'No token, authorization denied' }, 401)
    }

    const decoded = jwt.verify(token, c.env.JWT_SECRET)
    c.set('userId', decoded.userId)
    await next()
  } catch (error) {
    return c.json({ message: 'Token is not valid' }, 401)
  }
}

export const adminAuth = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return c.json({ message: 'No token, authorization denied' }, 401)
    }

    const decoded = jwt.verify(token, c.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user) {
      return c.json({ message: 'Token is not valid' }, 401)
    }

    if (user.role !== 'admin') {
      return c.json({ message: 'Access denied. Admin role required.' }, 403)
    }

    c.set('userId', user._id)
    c.set('userRole', user.role)
    await next()
  } catch (error) {
    return c.json({ message: 'Token is not valid' }, 401)
  }
}
