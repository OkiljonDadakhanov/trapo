const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  // User profile information for orders
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    dateOfBirth: Date,
    preferences: {
      size: String,
      favoriteColors: [String],
      style: String,
    },
  },
  // Gamification features
  stats: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    designsCreated: { type: Number, default: 0 },
    badges: [{
      name: String,
      description: String,
      icon: String,
      earnedAt: { type: Date, default: Date.now },
      category: String, // 'spending', 'activity', 'loyalty', 'special'
    }],
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    streak: { type: Number, default: 0 }, // consecutive days active
    lastActive: { type: Date, default: Date.now },
  },
  savedDesigns: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Design",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Method to add experience and check for level up
userSchema.methods.addExperience = function (points) {
  this.stats.experience += points
  
  // Check for level up (every 1000 XP = 1 level)
  const newLevel = Math.floor(this.stats.experience / 1000) + 1
  if (newLevel > this.stats.level) {
    this.stats.level = newLevel
    return { leveledUp: true, newLevel }
  }
  return { leveledUp: false, currentLevel: this.stats.level }
}

// Method to check and award badges
userSchema.methods.checkBadges = function () {
  const newBadges = []
  
  // Spending badges
  if (this.stats.totalSpent >= 1000 && !this.hasBadge('Big Spender')) {
    newBadges.push({
      name: 'Big Spender',
      description: 'Spent over $1000',
      icon: '💰',
      category: 'spending'
    })
  }
  
  if (this.stats.totalSpent >= 5000 && !this.hasBadge('VIP Customer')) {
    newBadges.push({
      name: 'VIP Customer',
      description: 'Spent over $5000',
      icon: '👑',
      category: 'spending'
    })
  }
  
  // Activity badges
  if (this.stats.totalOrders >= 10 && !this.hasBadge('Regular Customer')) {
    newBadges.push({
      name: 'Regular Customer',
      description: 'Made 10+ orders',
      icon: '⭐',
      category: 'activity'
    })
  }
  
  if (this.stats.designsCreated >= 5 && !this.hasBadge('Creative Designer')) {
    newBadges.push({
      name: 'Creative Designer',
      description: 'Created 5+ designs',
      icon: '🎨',
      category: 'activity'
    })
  }
  
  // Loyalty badges
  if (this.stats.streak >= 7 && !this.hasBadge('Week Warrior')) {
    newBadges.push({
      name: 'Week Warrior',
      description: '7 day activity streak',
      icon: '🔥',
      category: 'loyalty'
    })
  }
  
  if (this.stats.streak >= 30 && !this.hasBadge('Month Master')) {
    newBadges.push({
      name: 'Month Master',
      description: '30 day activity streak',
      icon: '🏆',
      category: 'loyalty'
    })
  }
  
  // Level badges
  if (this.stats.level >= 5 && !this.hasBadge('Rising Star')) {
    newBadges.push({
      name: 'Rising Star',
      description: 'Reached level 5',
      icon: '🌟',
      category: 'special'
    })
  }
  
  if (this.stats.level >= 10 && !this.hasBadge('Legend')) {
    newBadges.push({
      name: 'Legend',
      description: 'Reached level 10',
      icon: '💎',
      category: 'special'
    })
  }
  
  // Add new badges
  this.stats.badges.push(...newBadges)
  return newBadges
}

// Helper method to check if user has a specific badge
userSchema.methods.hasBadge = function (badgeName) {
  return this.stats.badges.some(badge => badge.name === badgeName)
}

// Method to update activity streak
userSchema.methods.updateStreak = function () {
  const now = new Date()
  const lastActive = new Date(this.stats.lastActive)
  const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24))
  
  if (daysDiff === 1) {
    this.stats.streak += 1
  } else if (daysDiff > 1) {
    this.stats.streak = 1 // Reset streak if more than 1 day gap
  }
  
  this.stats.lastActive = now
}

module.exports = mongoose.model("User", userSchema)
