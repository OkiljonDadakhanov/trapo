const express = require("express")
const Sticker = require("../models/Sticker")

const router = express.Router()

// Get all stickers
router.get("/", async (req, res) => {
  try {
    const { theme } = req.query
    const query = theme ? { theme } : {}
    const stickers = await Sticker.find(query)
    res.json(stickers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get stickers by theme
router.get("/theme/:theme", async (req, res) => {
  try {
    const stickers = await Sticker.find({ theme: req.params.theme })
    res.json(stickers)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
