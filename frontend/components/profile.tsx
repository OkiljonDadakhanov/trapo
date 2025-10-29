"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Award,
  Edit,
  Save,
  X,
  Zap,
  Package,
  CheckCircle,
  Truck,
  Clock,
} from "lucide-react"
import { usersAPI, ordersAPI } from "@/lib/api"
import { useCustomToast } from "@/components/custom-toast" // ✅ fixed import

interface UserProfile {
  _id: string
  name: string
  email: string
  createdAt: string
  profile: {
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
  stats: {
    totalOrders: number
    totalSpent: number
    designsCreated: number
    badges: Array<{
      name: string
      description: string
      icon: string
      earnedAt: string
      category: string
    }>
    level: number
    experience: number
    streak: number
    lastActive: string
  }
}

export function Profile() {
  const router = useRouter()
  const toast = useCustomToast() // ✅ unified toast usage

  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    dateOfBirth: "",
    preferences: {
      size: "",
      favoriteColors: [] as string[],
      style: "",
    },
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast.warning("Authentication Required", "Please login to view your profile")
      router.push("/auth/login")
      return
    }

    const fetchProfile = async () => {
      try {
        const userData = await usersAPI.getProfile()
        setUser(userData)
        setEditForm({
          firstName: userData.profile?.firstName || "",
          lastName: userData.profile?.lastName || "",
          phone: userData.profile?.phone || "",
          address: {
            street: userData.profile?.address?.street || "",
            city: userData.profile?.address?.city || "",
            state: userData.profile?.address?.state || "",
            zipCode: userData.profile?.address?.zipCode || "",
            country: userData.profile?.address?.country || "",
          },
          dateOfBirth: userData.profile?.dateOfBirth || "",
          preferences: {
            size: userData.profile?.preferences?.size || "",
            favoriteColors: userData.profile?.preferences?.favoriteColors || [],
            style: userData.profile?.preferences?.style || "",
          },
        })
      } catch {
        toast.error("Error", "Failed to load profile data")
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
    
    const fetchOrders = async () => {
      try {
        const ordersData = await ordersAPI.getAll()
        setOrders(ordersData)
      } catch (error) {
        console.error("Failed to fetch orders:", error)
      } finally {
        setOrdersLoading(false)
      }
    }
    
    fetchOrders()
  }, [router])

  const handleSave = async () => {
    try {
      const updatedData = await usersAPI.updateProfile({ profile: editForm })
      setUser(updatedData.user)
      setEditing(false)
      toast.success("Profile Updated", "Your profile has been updated successfully")
    } catch {
      toast.error("Error", "Failed to update profile")
    }
  }

  const getBadgeColor = (category: string) => {
    switch (category) {
      case "spending":
        return "bg-green-500"
      case "activity":
        return "bg-blue-500"
      case "loyalty":
        return "bg-purple-500"
      case "special":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }
  
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "ordered":
        return {
          label: "Ordered",
          icon: Clock,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
        }
      case "shipped":
        return {
          label: "Shipped",
          icon: Truck,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500/10",
        }
      case "completed":
        return {
          label: "Completed",
          icon: CheckCircle,
          color: "text-green-500",
          bgColor: "bg-green-500/10",
        }
      default:
        return {
          label: status,
          icon: Package,
          color: "text-gray-500",
          bgColor: "bg-gray-500/10",
        }
    }
  }

  const getCurrentLevelProgress = () => {
    if (!user) return 0
    const currentLevelXP = (user.stats.level - 1) * 1000
    const nextLevelXP = user.stats.level * 1000
    const progress =
      ((user.stats.experience - currentLevelXP) /
        (nextLevelXP - currentLevelXP)) *
      100
    return Math.max(0, Math.min(100, progress))
  }

  if (loading) {
    return (
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-muted-foreground">
            Please login to view your profile
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account, view stats, and track your progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Personal Information</h2>
                <button
                  onClick={() => setEditing(!editing)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  {editing ? <X size={20} /> : <Edit size={20} />}
                </button>
              </div>

              {editing ? (
                <div className="space-y-4">
                  {/* Editable Form Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={editForm.firstName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, firstName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={editForm.lastName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, lastName: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <input
                    type="tel"
                    placeholder="Phone"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />

                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) =>
                      setEditForm({ ...editForm, dateOfBirth: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90"
                    >
                      <Save size={16} /> Save
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                      <User size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {user.profile?.firstName && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">
                        <strong>Full Name:</strong> {user.profile.firstName}{" "}
                        {user.profile.lastName}
                      </p>
                      {user.profile.phone && (
                        <p className="text-sm text-muted-foreground">
                          <strong>Phone:</strong> {user.profile.phone}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        <strong>Member since:</strong>{" "}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="glass rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Shipping Address</h3>
              {editing ? (
                <div className="space-y-4">
                  {["street", "city", "state", "zipCode", "country"].map(
                    (field) => (
                      <input
                        key={field}
                        type="text"
                        placeholder={field
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (s) => s.toUpperCase())}
                        value={(editForm.address as any)[field]}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            address: {
                              ...editForm.address,
                              [field]: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    )
                  )}
                </div>
              ) : (
                <div>
                  {user.profile?.address?.street ? (
                    <div className="space-y-2">
                      <p className="text-sm">{user.profile.address.street}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.profile.address.city}, {user.profile.address.state}{" "}
                        {user.profile.address.zipCode}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.profile.address.country}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No address saved
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Preferences */}
            <div className="glass rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4">Preferences</h3>
              {editing ? (
                <div className="space-y-4">
                  <select
                    value={editForm.preferences.size}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        preferences: {
                          ...editForm.preferences,
                          size: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Select size</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Style Preference"
                    value={editForm.preferences.style}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        preferences: {
                          ...editForm.preferences,
                          style: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm">
                    <strong>Size:</strong>{" "}
                    {user.profile?.preferences?.size || "Not set"}
                  </p>
                  <p className="text-sm">
                    <strong>Style:</strong>{" "}
                    {user.profile?.preferences?.style || "Not set"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats and Gamification */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  Level {user.stats.level}
                </h2>
                <div className="flex items-center gap-2">
                  <Zap className="text-yellow-500" size={20} />
                  <span className="text-sm font-medium">
                    {user.stats.experience} XP
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                  <span>Progress to Level {user.stats.level + 1}</span>
                  <span>{getCurrentLevelProgress().toFixed(0)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-accent to-yellow-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getCurrentLevelProgress()}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {user.stats.totalOrders}
                  </div>
                  <div className="text-sm text-muted-foreground">Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    ${user.stats.totalSpent}
                  </div>
                  <div className="text-sm text-muted-foreground">Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {user.stats.designsCreated}
                  </div>
                  <div className="text-sm text-muted-foreground">Designs</div>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="glass rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">
                Badges & Achievements
              </h3>

              {user.stats.badges.length === 0 ? (
                <div className="text-center py-8">
                  <Award
                    size={48}
                    className="mx-auto text-muted-foreground mb-4"
                  />
                  <p className="text-muted-foreground">No badges yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start shopping and creating to earn badges!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {user.stats.badges.map((badge, i) => (
                    <div
                      key={i}
                      className="text-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={`w-12 h-12 ${getBadgeColor(
                          badge.category
                        )} rounded-full flex items-center justify-center text-white text-xl mx-auto mb-2`}
                      >
                        {badge.icon}
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        {badge.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {badge.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Earned{" "}
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Streak */}
            <div className="glass rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Activity Streak</h3>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-orange-500">
                  {user.stats.streak}
                </div>
                <div>
                  <p className="font-semibold">Day Streak</p>
                  <p className="text-sm text-muted-foreground">
                    Keep visiting to maintain your streak!
                  </p>
                </div>
              </div>
            </div>
            
            {/* Orders */}
            <div className="glass rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">My Orders</h3>
              {ordersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start shopping to see your orders here!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const statusInfo = getStatusInfo(order.status)
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <div
                        key={order._id}
                        className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                              <StatusIcon className={`${statusInfo.color}`} size={20} />
                            </div>
                            <div>
                              <p className="font-semibold">{order.orderNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {item.name} x{item.quantity}
                              </span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total</span>
                            <span className="font-bold">${order.total?.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
