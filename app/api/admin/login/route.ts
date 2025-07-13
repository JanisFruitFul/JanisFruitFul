import connectDB from "@/backend/lib/mongodb"
import Admin from "@/backend/models/Admin"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { type NextRequest, NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_here"
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || "6LdmaIErAAAAAFczCJQlafDRyfIOAnfWoi_fd7Ov"

// Function to verify reCAPTCHA token
async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
    })

    const data = await response.json()
    return data.success === true
  } catch (error) {
    console.error('reCAPTCHA verification error:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password, captchaToken } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Verify reCAPTCHA token
    if (!captchaToken) {
      return NextResponse.json({ success: false, message: "reCAPTCHA verification required" }, { status: 400 })
    }

    const isCaptchaValid = await verifyRecaptcha(captchaToken)
    if (!isCaptchaValid) {
      return NextResponse.json({ success: false, message: "reCAPTCHA verification failed" }, { status: 400 })
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() })

    if (!admin) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, admin.password)

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Update last login
    admin.lastLogin = new Date()
    await admin.save()

    // Generate JWT token with the structure expected by the frontend
    const token = jwt.sign({ 
      user: {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role || 'admin'
      }
    }, JWT_SECRET, { expiresIn: "7d" })

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      token: token, // Include token in response body for client-side storage
      user: {
        id: admin._id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
    })

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
