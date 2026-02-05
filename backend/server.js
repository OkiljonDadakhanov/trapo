const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const rateLimit = require("express-rate-limit")

dotenv.config()

const app = express()

// Rate limiting configuration
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit auth attempts to 10 per 15 minutes
  message: { message: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply general rate limiting to all requests
app.use(generalLimiter)

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000", // for local dev
  "https://trapo-three.vercel.app",
  "https://admin-trapo.vercel.app" // Vercel production frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/trapo")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authLimiter, require("./routes/auth"))
app.use("/api/users", require("./routes/users"))
app.use("/api/designs", require("./routes/designs"))
app.use("/api/orders", require("./routes/orders"))
app.use("/api/products", require("./routes/products"))
app.use("/api/stickers", require("./routes/stickers"))
app.use("/api/cart", require("./routes/cart"))
app.use("/api/admin", authLimiter, require("./routes/admin"))

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Backend is running" })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
