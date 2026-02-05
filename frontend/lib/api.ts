const API_URL = process.env.NEXT_PUBLIC_API_URL

// Types for API payloads
export interface ProfileFields {
  firstName?: string
  lastName?: string
  phone?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  dateOfBirth?: string
  preferences?: {
    size?: string
    favoriteColors?: string[]
    style?: string
  }
}

export interface ProfileData {
  profile?: ProfileFields
}

export interface StickerData {
  id: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  surface: "front" | "back" | "sleeve"
  zIndex: number
}

export interface DesignData {
  name: string
  productType: "t-shirt" | "hoodie" | "jacket" | string
  color: string
  size: string
  stickers: StickerData[]
  customImages?: Array<{
    url: string
    x: number
    y: number
    width: number
    height: number
    rotation: number
    surface: string
    zIndex: number
  }>
  price: number
  previewImage?: string
}

export interface OrderItem {
  type: "design" | "product" | "custom"
  designId?: string
  productId?: string
  customId?: string
  quantity: number
  price: number
  name: string
}

export interface CustomerInfo {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface OrderData {
  items: OrderItem[]
  customerInfo: CustomerInfo
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export interface CartItem {
  _id?: string
  type: "product" | "design" | "custom"
  productId?: string
  designId?: string
  customId?: string
  name: string
  price: number
  quantity: number
  customDesign?: {
    color: string
    size: string
    surface: string
    stickers: Array<{ id: string; x: number; y: number; scale: number; rotation: number }>
  }
  image?: string
}

export interface Cart {
  _id: string
  userId: string
  items: CartItem[]
  total: number
  updatedAt: string
}

export interface PaginationParams {
  page?: number
  limit?: number
}

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  // Get response text first to handle empty responses
  const text = await response.text()

  // Try to parse as JSON, or return empty object if empty
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    data = { message: text || "Unknown error" }
  }

  if (!response.ok) {
    throw new Error(data.message || `API request failed (${response.status})`)
  }

  return data
}

// Auth API
export const authAPI = {
  register: (name: string, email: string, password: string) =>
    apiCall("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    apiCall("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
}

// Users API
export const usersAPI = {
  getProfile: () => apiCall("/api/users/profile"),
  updateProfile: (data: ProfileData) =>
    apiCall("/api/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  updateStats: (action: string, value?: number) =>
    apiCall("/api/users/stats", {
      method: "PUT",
      body: JSON.stringify({ action, value }),
    }),
  getStats: () => apiCall("/api/users/stats"),
}

// Designs API
export const designsAPI = {
  create: (design: DesignData) =>
    apiCall("/api/designs", {
      method: "POST",
      body: JSON.stringify(design),
    }),
  getAll: (params?: PaginationParams) => {
    const query = params ? `?page=${params.page || 1}&limit=${params.limit || 10}` : ""
    return apiCall(`/api/designs${query}`)
  },
  getById: (id: string) => apiCall(`/api/designs/${id}`),
  getByShareLink: (shareLink: string) => apiCall(`/api/designs/share/${shareLink}`),
  generateShareLink: (id: string) =>
    apiCall(`/api/designs/${id}/share`, { method: "POST" }),
  update: (id: string, design: Partial<DesignData>) =>
    apiCall(`/api/designs/${id}`, {
      method: "PUT",
      body: JSON.stringify(design),
    }),
  delete: (id: string) =>
    apiCall(`/api/designs/${id}`, {
      method: "DELETE",
    }),
}

// Orders API
export const ordersAPI = {
  create: (order: OrderData) =>
    apiCall("/api/orders", {
      method: "POST",
      body: JSON.stringify(order),
    }),
  getAll: (params?: PaginationParams) => {
    const query = params ? `?page=${params.page || 1}&limit=${params.limit || 10}` : ""
    return apiCall(`/api/orders${query}`)
  },
  getById: (id: string) => apiCall(`/api/orders/${id}`),
  updateStatus: (id: string, status: string, note?: string) =>
    apiCall(`/api/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, note }),
    }),
}

// Products API
export const productsAPI = {
  getAll: () => apiCall("/api/products"),
  getById: (id: string) => apiCall(`/api/products/${id}`),
}

// Stickers API
export const stickersAPI = {
  getAll: (theme?: string) => apiCall(`/api/stickers${theme ? `?theme=${theme}` : ""}`),
  getByTheme: (theme: string) => apiCall(`/api/stickers/theme/${theme}`),
}

// Cart API
export const cartAPI = {
  get: (): Promise<Cart> => apiCall("/api/cart"),
  addItem: (item: Omit<CartItem, "_id">) =>
    apiCall("/api/cart/items", {
      method: "POST",
      body: JSON.stringify(item),
    }),
  updateItem: (itemId: string, quantity: number) =>
    apiCall(`/api/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    }),
  removeItem: (itemId: string) =>
    apiCall(`/api/cart/items/${itemId}`, {
      method: "DELETE",
    }),
  clear: () =>
    apiCall("/api/cart", {
      method: "DELETE",
    }),
  sync: (items: CartItem[]) =>
    apiCall("/api/cart/sync", {
      method: "PUT",
      body: JSON.stringify({ items }),
    }),
}

// Admin API (for admin panel)
export const adminAPI = {
  // Dashboard
  getDashboard: () => apiCall("/api/admin/dashboard"),

  // Orders management
  getAllOrders: (params?: PaginationParams) => {
    const query = params ? `?page=${params.page || 1}&limit=${params.limit || 10}` : ""
    return apiCall(`/api/admin/orders${query}`)
  },
  updateOrderStatus: (id: string, status: string, note?: string) =>
    apiCall(`/api/admin/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, note }),
    }),

  // Users management
  getAllUsers: (params?: PaginationParams) => {
    const query = params ? `?page=${params.page || 1}&limit=${params.limit || 10}` : ""
    return apiCall(`/api/admin/users${query}`)
  },

  // Products management
  createProduct: (product: { name: string; category: string; price: number; stock: number; description?: string; image?: string; colors?: string[]; sizes?: string[] }) =>
    apiCall("/api/products", {
      method: "POST",
      body: JSON.stringify(product),
    }),
  updateProduct: (id: string, product: Partial<{ name: string; category: string; price: number; stock: number; description: string; image: string; colors: string[]; sizes: string[] }>) =>
    apiCall(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    }),
  deleteProduct: (id: string) =>
    apiCall(`/api/products/${id}`, {
      method: "DELETE",
    }),

  // Stickers management
  createSticker: (sticker: { name: string; image: string; theme: string; isPremium?: boolean; isLimitedEdition?: boolean; price?: number }) =>
    apiCall("/api/admin/stickers", {
      method: "POST",
      body: JSON.stringify(sticker),
    }),
  updateSticker: (id: string, sticker: Partial<{ name: string; image: string; theme: string; isPremium: boolean; isLimitedEdition: boolean; price: number }>) =>
    apiCall(`/api/admin/stickers/${id}`, {
      method: "PUT",
      body: JSON.stringify(sticker),
    }),
  deleteSticker: (id: string) =>
    apiCall(`/api/admin/stickers/${id}`, {
      method: "DELETE",
    }),
}
