import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

// Don't throw error during build time, just return a mock connection
if (!MONGODB_URI) {
  console.warn("MONGODB_URI not set - this is expected during build time")
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  // If no MongoDB URI, return a mock connection for build time
  if (!MONGODB_URI) {
    console.warn("MongoDB connection skipped - no URI provided")
    return null
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("Connected to MongoDB Atlas")
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB 