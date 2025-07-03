import mongoose, { type Document, Schema } from "mongoose"

export interface IOrder {
  drinkType: string
  itemName: string
  itemId: mongoose.Types.ObjectId
  price: number
  date: Date
  isReward: boolean
}

export interface ICustomer extends Document {
  name: string
  phone: string
  orders: IOrder[]
  totalOrders: number
  rewardsEarned: number
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>({
  drinkType: {
    type: String,
    required: true,
    enum: ["Mojito", "Ice Cream", "Milkshake", "Waffle", "Reward"],
  },
  itemName: {
    type: String,
    required: true,
  },
  itemId: {
    type: Schema.Types.ObjectId,
    ref: "MenuItem",
    required: function(this: IOrder) {
      return this.drinkType !== "Reward";
    },
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  isReward: {
    type: Boolean,
    default: false,
  },
})

const CustomerSchema = new Schema<ICustomer>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  orders: [OrderSchema],
  totalOrders: {
    type: Number,
    default: 0,
  },
  rewardsEarned: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update totalOrders before saving
CustomerSchema.pre("save", function (next) {
  this.totalOrders = this.orders.length
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Customer || mongoose.model<ICustomer>("Customer", CustomerSchema) 