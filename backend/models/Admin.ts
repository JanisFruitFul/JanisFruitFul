import mongoose, { type Document, Schema } from "mongoose"

export interface IAdmin extends Document {
  username: string
  email: string
  password: string
  role: string
  createdAt: Date
  lastLogin?: Date
}

const AdminSchema = new Schema<IAdmin>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "admin",
    enum: ["admin", "super_admin"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
})

export default mongoose.models.Admin || mongoose.model<IAdmin>("Admin", AdminSchema) 