const { body, param, validationResult } = require("express-validator")

// Middleware to check validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    })
  }
  next()
}

// Auth validation rules
const registerValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be 2-100 characters"),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  handleValidationErrors
]

const loginValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required"),
  handleValidationErrors
]

// Design validation rules
const designValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage("Name must be less than 200 characters"),
  body("productType")
    .notEmpty().withMessage("Product type is required")
    .isIn(["t-shirt", "hoodie", "jacket", "cap", "sweatshirt"]).withMessage("Invalid product type"),
  body("color")
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage("Invalid color format (use hex like #000000)"),
  body("size")
    .optional()
    .isIn(["XS", "S", "M", "L", "XL", "XXL"]).withMessage("Invalid size"),
  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  handleValidationErrors
]

// Order validation rules
const orderValidation = [
  body("items")
    .isArray({ min: 1 }).withMessage("Order must have at least one item"),
  body("items.*.type")
    .isIn(["design", "product", "custom"]).withMessage("Invalid item type"),
  body("items.*.quantity")
    .isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  body("items.*.price")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("items.*.name")
    .trim()
    .notEmpty().withMessage("Item name is required"),
  body("customerInfo.name")
    .trim()
    .notEmpty().withMessage("Customer name is required"),
  body("customerInfo.email")
    .trim()
    .isEmail().withMessage("Valid email is required"),
  body("customerInfo.phone")
    .optional()
    .trim(),
  body("customerInfo.address")
    .trim()
    .notEmpty().withMessage("Address is required"),
  body("customerInfo.city")
    .trim()
    .notEmpty().withMessage("City is required"),
  body("customerInfo.state")
    .trim()
    .notEmpty().withMessage("State is required"),
  body("customerInfo.zipCode")
    .trim()
    .notEmpty().withMessage("ZIP code is required"),
  body("customerInfo.country")
    .trim()
    .notEmpty().withMessage("Country is required"),
  body("total")
    .isFloat({ min: 0 }).withMessage("Total must be a positive number"),
  handleValidationErrors
]

// Product validation rules
const productValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Product name is required")
    .isLength({ max: 200 }).withMessage("Name must be less than 200 characters"),
  body("category")
    .trim()
    .notEmpty().withMessage("Category is required"),
  body("price")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("stock")
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage("Description must be less than 2000 characters"),
  handleValidationErrors
]

// MongoDB ID validation
const mongoIdValidation = [
  param("id")
    .isMongoId().withMessage("Invalid ID format"),
  handleValidationErrors
]

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  designValidation,
  orderValidation,
  productValidation,
  mongoIdValidation
}
