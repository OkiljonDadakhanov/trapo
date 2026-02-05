/**
 * Script to create admin user
 * Run with: node scripts/createAdmin.js
 */
require("dotenv").config()
const mongoose = require("mongoose")
const User = require("../models/User")

const ADMIN_EMAIL = "akilhan"
const ADMIN_PASSWORD = "Oqillion1305+"
const ADMIN_NAME = "Akilhan Admin"

async function createAdmin() {
  try {
    console.log("Connecting to MongoDB...")
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL })
    if (existingAdmin) {
      console.log("Admin user already exists with email:", ADMIN_EMAIL)
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin"
        await existingAdmin.save()
        console.log("Updated existing user to admin role")
      }
      process.exit(0)
    }

    // Create new admin
    const admin = new User({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin"
    })

    await admin.save()
    console.log("Admin created successfully!")
    console.log("Email:", ADMIN_EMAIL)
    console.log("Password:", ADMIN_PASSWORD)

    process.exit(0)
  } catch (error) {
    console.error("Error creating admin:", error.message)
    process.exit(1)
  }
}

createAdmin()
