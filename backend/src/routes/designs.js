import { Hono } from 'hono'
import crypto from 'node:crypto'
import { auth } from '../middleware/auth.js'
import Design from '../models/Design.js'

const app = new Hono()

// Create design (auth required)
app.post('/', auth, async (c) => {
  try {
    const body = await c.req.json()
    const design = new Design({ userId: c.get('userId'), ...body })
    await design.save()
    return c.json(design, 201)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Get user's designs (auth required, with pagination)
app.get('/', auth, async (c) => {
  try {
    const page = parseInt(c.req.query('page')) || 1
    const limit = parseInt(c.req.query('limit')) || 10
    const skip = (page - 1) * limit

    const [designs, total] = await Promise.all([
      Design.find({ userId: c.get('userId') }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Design.countDocuments({ userId: c.get('userId') })
    ])

    return c.json({ designs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Get design by share link (public)
app.get('/share/:shareLink', async (c) => {
  try {
    const design = await Design.findOne({ shareLink: c.req.param('shareLink') })
    if (!design) return c.json({ message: 'Design not found' }, 404)
    return c.json(design)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Get single design (public)
app.get('/:id', async (c) => {
  try {
    const design = await Design.findById(c.req.param('id'))
    if (!design) return c.json({ message: 'Design not found' }, 404)
    return c.json(design)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Update design (auth required)
app.put('/:id', auth, async (c) => {
  try {
    const body = await c.req.json()
    const design = await Design.findByIdAndUpdate(c.req.param('id'), body, { new: true })
    return c.json(design)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Delete design (auth required)
app.delete('/:id', auth, async (c) => {
  try {
    await Design.findByIdAndDelete(c.req.param('id'))
    return c.json({ message: 'Design deleted' })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Generate share link (auth required)
app.post('/:id/share', auth, async (c) => {
  try {
    const design = await Design.findOne({ _id: c.req.param('id'), userId: c.get('userId') })
    if (!design) return c.json({ message: 'Design not found' }, 404)

    if (!design.shareLink) {
      design.shareLink = crypto.randomBytes(8).toString('hex')
      await design.save()
    }

    return c.json({
      shareLink: design.shareLink,
      shareUrl: `${c.env.FRONTEND_URL}/design/share/${design.shareLink}`
    })
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

export default app
