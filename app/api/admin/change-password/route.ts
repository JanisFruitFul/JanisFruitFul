import connectDB from "@/backend/lib/mongodb"
import Admin from "@/backend/models/Admin"
import bcrypt from "bcryptjs"
import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/server-auth"

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAuth(request)
    if ('error' in authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current password and new password are required" },
        { status: 400 },
      )
    }

    // Find admin (assuming single admin for now)
    const admin = await Admin.findOne({})

    if (!admin) {
      return NextResponse.json({ success: false, message: "Admin not found" }, { status: 404 })
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password)

    if (!isCurrentPasswordValid) {
      return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 400 })
    }

    // Hash new password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    admin.password = hashedNewPassword
    await admin.save()

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch {
    // Failed to change password
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    )
  }
}
