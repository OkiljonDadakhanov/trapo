const API_URL = process.env.NEXT_PUBLIC_API_URL 
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "API request failed")
  }

  return response.json()
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
  updateProfile: (data: any) =>
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
  create: (design: any) =>
    apiCall("/api/designs", {
      method: "POST",
      body: JSON.stringify(design),
    }),
  getAll: () => apiCall("/api/designs"),
  getById: (id: string) => apiCall(`/api/designs/${id}`),
  update: (id: string, design: any) =>
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
  create: (order: any) =>
    apiCall("/api/orders", {
      method: "POST",
      body: JSON.stringify(order),
    }),
  getAll: () => apiCall("/api/orders"),
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
