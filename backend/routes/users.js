const express = require("express")
const auth = require("../middleware/auth")
const User = require("../models/User")

const router = express.Router()

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("savedDesigns")
    
    // Update activity streak
    user.updateStreak()
    await user.save()
    
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, req.body, { new: true })
    
    // Check for new badges after profile update
    const newBadges = user.checkBadges()
    await user.save()
    
    res.json({ user, newBadges })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update user stats (for orders, designs, etc.)
router.put("/stats", auth, async (req, res) => {
  try {
    const { action, value } = req.body
    const user = await User.findById(req.userId)
    
    let newBadges = []
    let levelUp = null
    
    switch (action) {
      case 'order':
        user.stats.totalOrders += 1
        user.stats.totalSpent += value || 0
        levelUp = user.addExperience(100) // 100 XP per order
        newBadges = user.checkBadges()
        break
        
      case 'design':
        user.stats.designsCreated += 1
        levelUp = user.addExperience(50) // 50 XP per design
        newBadges = user.checkBadges()
        break
        
      case 'login':
        user.updateStreak()
        break
    }
    
    await user.save()
    
    res.json({ 
      user, 
      newBadges, 
      levelUp,
      message: levelUp?.leveledUp ? `Level up! You're now level ${levelUp.newLevel}` : null
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Get user stats and badges
router.get("/stats", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('stats name')
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router
