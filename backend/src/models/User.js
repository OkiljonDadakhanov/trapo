import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    address: { street: String, city: String, state: String, zipCode: String, country: String },
    dateOfBirth: Date,
    preferences: { size: String, favoriteColors: [String], style: String },
  },
  stats: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    designsCreated: { type: Number, default: 0 },
    badges: [{ name: String, description: String, icon: String, earnedAt: { type: Date, default: Date.now }, category: String }],
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
  },
  savedDesigns: [{ type: mongoose.Schema.Types.ObjectId, ref: "Design" }],
  createdAt: { type: Date, default: Date.now },
})

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.addExperience = function (points) {
  this.stats.experience += points
  const newLevel = Math.floor(this.stats.experience / 1000) + 1
  if (newLevel > this.stats.level) {
    this.stats.level = newLevel
    return { leveledUp: true, newLevel }
  }
  return { leveledUp: false, currentLevel: this.stats.level }
}

userSchema.methods.hasBadge = function (badgeName) {
  return this.stats.badges.some(badge => badge.name === badgeName)
}

userSchema.methods.checkBadges = function () {
  const newBadges = []
  const checks = [
    { condition: this.stats.totalSpent >= 1000, name: 'Big Spender', desc: 'Spent over $1000', icon: '💰', cat: 'spending' },
    { condition: this.stats.totalSpent >= 5000, name: 'VIP Customer', desc: 'Spent over $5000', icon: '👑', cat: 'spending' },
    { condition: this.stats.totalOrders >= 10, name: 'Regular Customer', desc: 'Made 10+ orders', icon: '⭐', cat: 'activity' },
    { condition: this.stats.designsCreated >= 5, name: 'Creative Designer', desc: 'Created 5+ designs', icon: '🎨', cat: 'activity' },
    { condition: this.stats.streak >= 7, name: 'Week Warrior', desc: '7 day activity streak', icon: '🔥', cat: 'loyalty' },
    { condition: this.stats.streak >= 30, name: 'Month Master', desc: '30 day activity streak', icon: '🏆', cat: 'loyalty' },
    { condition: this.stats.level >= 5, name: 'Rising Star', desc: 'Reached level 5', icon: '🌟', cat: 'special' },
    { condition: this.stats.level >= 10, name: 'Legend', desc: 'Reached level 10', icon: '💎', cat: 'special' },
  ]
  for (const c of checks) {
    if (c.condition && !this.hasBadge(c.name)) {
      newBadges.push({ name: c.name, description: c.desc, icon: c.icon, category: c.cat })
    }
  }
  this.stats.badges.push(...newBadges)
  return newBadges
}

userSchema.methods.updateStreak = function () {
  const now = new Date()
  const lastActive = new Date(this.stats.lastActive)
  const daysDiff = Math.floor((now - lastActive) / (1000 * 60 * 60 * 24))
  if (daysDiff === 1) this.stats.streak += 1
  else if (daysDiff > 1) this.stats.streak = 1
  this.stats.lastActive = now
}

export default mongoose.model("User", userSchema)
