import { Hono } from 'hono'
import { auth } from '../middleware/auth.js'
import User from '../models/User.js'

const app = new Hono()

app.use('*', auth)

// Get profile
app.get('/profile', async (c) => {
  try {
    const user = await User.findById(c.get('userId')).select('-password').populate('savedDesigns')
    if (!user) return c.json({ message: 'User not found' }, 404)
    return c.json(user)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Update profile
app.put('/profile', async (c) => {
  try {
    const updates = await c.req.json()
    const user = await User.findById(c.get('userId'))
    if (!user) return c.json({ message: 'User not found' }, 404)

    if (updates.firstName !== undefined) user.profile.firstName = updates.firstName
    if (updates.lastName !== undefined) user.profile.lastName = updates.lastName
    if (updates.phone !== undefined) user.profile.phone = updates.phone
    if (updates.dateOfBirth !== undefined) user.profile.dateOfBirth = updates.dateOfBirth
    if (updates.address) {
      user.profile.address = { ...user.profile.address, ...updates.address }
    }
    if (updates.preferences) {
      user.profile.preferences = { ...user.profile.preferences, ...updates.preferences }
    }

    await user.save()
    return c.json(user)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Update stats
app.put('/stats', async (c) => {
  try {
    const { action, value } = await c.req.json()
    const user = await User.findById(c.get('userId'))
    if (!user) return c.json({ message: 'User not found' }, 404)

    let xpGained = 0
    switch (action) {
      case 'order':
        user.stats.totalOrders += 1
        user.stats.totalSpent += value || 0
        xpGained = 100 + Math.floor((value || 0) / 10)
        break
      case 'design':
        user.stats.designsCreated += 1
        xpGained = 50
        break
      case 'login':
        user.updateStreak()
        xpGained = 10
        break
    }

    const levelResult = user.addExperience(xpGained)
    const newBadges = user.checkBadges()
    await user.save()

    return c.json({ stats: user.stats, xpGained, levelResult, newBadges })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Get stats
app.get('/stats', async (c) => {
  try {
    const user = await User.findById(c.get('userId')).select('stats')
    if (!user) return c.json({ message: 'User not found' }, 404)
    return c.json(user.stats)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

export default app
