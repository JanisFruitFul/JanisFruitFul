import mongoose, { type Document, Schema } from "mongoose"

export interface IMenuItem extends Document {
  name: string
  category: string
  price: number
  image: string
  description?: string
  isActive: boolean
  createdAt: Date
}

const MenuItemSchema = new Schema<IMenuItem>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ["Mojito", "Ice Cream", "Milkshake", "Waffle"],
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    default: "/placeholder.svg?height=200&width=200",
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>("MenuItem", MenuItemSchema) 