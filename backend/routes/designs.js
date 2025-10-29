const express = require("express")
const auth = require("../middleware/auth")
const Design = require("../models/Design")

const router = express.Router()

// Create design
router.post("/", auth, async (req, res) => {
  try {
    const design = new Design({
      userId: req.userId,
      ...req.body,
    })
    await design.save()
    res.status(201).json(design)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get user's designs
router.get("/", auth, async (req, res) => {
  try {
    const designs = await Design.find({ userId: req.userId })
    res.json(designs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single design
router.get("/:id", async (req, res) => {
  try {
    const design = await Design.findById(req.params.id)
    if (!design) {
      return res.status(404).json({ message: "Design not found" })
    }
    res.json(design)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update design
router.put("/:id", auth, async (req, res) => {
  try {
    const design = await Design.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(design)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete design
router.delete("/:id", auth, async (req, res) => {
  try {
    await Design.findByIdAndDelete(req.params.id)
    res.json({ message: "Design deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
