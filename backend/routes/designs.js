const express = require("express")
const crypto = require("crypto")
const auth = require("../middleware/auth")
const Design = require("../models/Design")
const { designValidation, mongoIdValidation } = require("../middleware/validate")

const router = express.Router()

// Create design
router.post("/", auth, designValidation, async (req, res) => {
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

// Get user's designs (with pagination)
router.get("/", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const [designs, total] = await Promise.all([
      Design.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Design.countDocuments({ userId: req.userId })
    ])

    res.json({
      designs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get design by share link (public)
router.get("/share/:shareLink", async (req, res) => {
  try {
    const design = await Design.findOne({ shareLink: req.params.shareLink })
    if (!design) {
      return res.status(404).json({ message: "Design not found" })
    }
    res.json(design)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get single design
router.get("/:id", mongoIdValidation, async (req, res) => {
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
router.put("/:id", auth, mongoIdValidation, async (req, res) => {
  try {
    const design = await Design.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(design)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete design
router.delete("/:id", auth, mongoIdValidation, async (req, res) => {
  try {
    await Design.findByIdAndDelete(req.params.id)
    res.json({ message: "Design deleted" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Generate share link for design
router.post("/:id/share", auth, mongoIdValidation, async (req, res) => {
  try {
    const design = await Design.findOne({ _id: req.params.id, userId: req.userId })
    if (!design) {
      return res.status(404).json({ message: "Design not found" })
    }

    // Generate unique share link if not exists
    if (!design.shareLink) {
      design.shareLink = crypto.randomBytes(8).toString("hex")
      await design.save()
    }

    res.json({
      shareLink: design.shareLink,
      shareUrl: `${process.env.FRONTEND_URL}/design/share/${design.shareLink}`
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
