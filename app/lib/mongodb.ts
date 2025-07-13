import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

// Don't throw error during build time, just return a mock connection
if (!MONGODB_URI) {
  // MONGODB_URI not set - this is expected during build time
  return null
}

// Extend global type to include mongoose
declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  // If no MongoDB URI, return a mock connection for build time
  if (!MONGODB_URI) {
    // MongoDB connection skipped - no URI provided
    return null
  }

  if (cached?.conn) {
    return cached.conn
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000, // 8 seconds
      socketTimeoutMS: 30000, // 30 seconds
      connectTimeoutMS: 8000, // 8 seconds
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 15000,
      heartbeatFrequencyMS: 10000,
    }

    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose
    }).catch((error) => {
      // MongoDB connection error
      return null
    })
  }

  try {
    cached!.conn = await cached!.promise
  } catch (e) {
    // Failed to establish MongoDB connection
    return null
  }

  return cached!.conn
}

export default connectDB 