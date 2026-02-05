import { Hono } from 'hono'
import Sticker from '../models/Sticker.js'

const app = new Hono()

// Get all stickers
app.get('/', async (c) => {
  try {
    const theme = c.req.query('theme')
    const query = theme ? { theme } : {}
    const stickers = await Sticker.find(query)
    return c.json(stickers)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

// Get stickers by theme
app.get('/theme/:theme', async (c) => {
  try {
    const stickers = await Sticker.find({ theme: c.req.param('theme') })
    return c.json(stickers)
  } catch (error) {
    return c.json({ message: error.message }, 500)
  }
})

export default app
