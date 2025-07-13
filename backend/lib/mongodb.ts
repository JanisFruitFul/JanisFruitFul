import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set.');
}

// Extend global type to include mongoose
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

let cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = global.mongoose as any;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB(): Promise<typeof mongoose> {
  if (cached?.conn) {
    return cached.conn;
  }

  if (!cached?.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (e) {
    cached!.promise = null;
    throw e;
  }

  return cached!.conn!;
}

export default connectDB 