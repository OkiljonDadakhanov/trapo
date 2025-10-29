const jwt = require("jsonwebtoken")
const User = require("../models/User")

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    const user = await User.findById(decoded.userId)
    
    if (!user) {
      return res.status(401).json({ message: "Token is not valid" })
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." })
    }

    req.userId = user._id
    req.userRole = user.role
    next()
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" })
  }
}

module.exports = adminAuth
