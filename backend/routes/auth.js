const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const { registerValidation, loginValidation } = require("../middleware/validate")

const router = express.Router()

// Register
router.post("/register", registerValidation, async (req, res) => {
  try {
    const { name, email, password } = req.body

    let user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: "User already exists" })
    }

    user = new User({ name, email, password })
    await user.save()

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Login
router.post("/login", loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
