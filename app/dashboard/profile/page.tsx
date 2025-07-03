"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getApiUrl } from "@/lib/config"
import { Building2, Calendar, Clock, Mail, MapPin, Phone, Shield, User } from "lucide-react"
import { useEffect, useState } from "react"

interface ProfileData {
  admin: {
    name: string
    email: string
    role: string
    joinDate: string
    lastLogin: string
  }
  shop: {
    name: string
    phone: string
    email: string
    address: string
    established: string
    license: string
  }
  stats: {
    totalCustomers: number
    totalOrders: number
    totalRevenue: number
    rewardsGiven: number
  }
}

export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfileData()
  }, [])

  const fetchProfileData = async () => {
    try {
      const response = await fetch(getApiUrl('api/admin/profile'))
      const data = await response.json()
      setProfileData(data)
    } catch (error) {
      console.error("Failed to fetch profile data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load profile data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Admin and shop information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Admin Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-emerald-600" />
              </div>
              Admin Information
            </CardTitle>
            <CardDescription>Your account details and permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Name</span>
                </div>
                <span className="text-sm text-gray-700">{profileData.admin.name}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <span className="text-sm text-gray-700">{profileData.admin.email}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Role</span>
                </div>
                <Badge className="bg-emerald-600">{profileData.admin.role}</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Joined</span>
                </div>
                <span className="text-sm text-gray-700">{profileData.admin.joinDate}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Last Login</span>
                </div>
                <span className="text-sm text-gray-700">{profileData.admin.lastLogin}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shop Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              Shop Details
            </CardTitle>
            <CardDescription>Business information and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Shop Name</span>
                </div>
                <span className="text-sm text-gray-700 font-semibold">{profileData.shop.name}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Phone</span>
                </div>
                <span className="text-sm text-gray-700">{profileData.shop.phone}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <span className="text-sm text-gray-700">{profileData.shop.email}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3 mb-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                  <span className="text-sm font-medium">Address</span>
                </div>
                <p className="text-sm text-gray-700 ml-7">{profileData.shop.address}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">Established</span>
                </div>
                <span className="text-sm text-gray-700">{profileData.shop.established}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Business Overview</CardTitle>
          <CardDescription>Key performance metrics and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">{profileData.stats.totalCustomers}</div>
              <div className="text-sm text-gray-600">Total Customers</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{profileData.stats.totalOrders}</div>
              <div className="text-sm text-gray-600">Total Orders</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                ₹{profileData.stats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{profileData.stats.rewardsGiven}</div>
              <div className="text-sm text-gray-600">Rewards Given</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* License Information */}
      <Card>
        <CardHeader>
          <CardTitle>License & Compliance</CardTitle>
          <CardDescription>Business registration and compliance information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">FSSAI License</p>
                <p className="text-sm text-green-600">{profileData.shop.license}</p>
              </div>
            </div>
            <Badge className="bg-green-600">Active</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
