import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

// Use a unique symbol to avoid type conflicts on global
const MONGOOSE_CACHE = Symbol.for('mongoose.cache');

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithCache = global as typeof global & Record<symbol, MongooseCache>;
const cached: MongooseCache = globalWithCache[MONGOOSE_CACHE] || { conn: null, promise: null };
globalWithCache[MONGOOSE_CACHE] = cached;

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

    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose
    }).catch(() => {
      // MongoDB connection error
      // Instead of returning null, throw to be caught below
      throw new Error('MongoDB connection error')
    })
  }

  try {
    cached!.conn = await cached!.promise
  } catch {
    // Failed to establish MongoDB connection
    cached!.conn = null
    return null
  }

  return cached!.conn
}

export default connectDB 