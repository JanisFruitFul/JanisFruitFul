"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MONGODB_URI = process.env.MONGODB_URI;
// Don't throw error during build time, just return a mock connection
if (!MONGODB_URI) {
    console.warn("MONGODB_URI not set - this is expected during build time");
}
let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}
async function connectDB() {
    // If no MongoDB URI, return a mock connection for build time
    if (!MONGODB_URI) {
        console.warn("MongoDB connection skipped - no URI provided");
        return null;
    }
    if (cached?.conn) {
        return cached.conn;
    }
    if (!cached?.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached.promise = mongoose_1.default.connect(MONGODB_URI, opts).then((mongoose) => {
            return mongoose;
        });
    }
    try {
        cached.conn = await cached.promise;
    }
    catch (e) {
        cached.promise = null;
        throw e;
    }
    return cached.conn;
}
exports.default = connectDB;
