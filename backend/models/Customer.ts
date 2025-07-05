import mongoose, { type Document, Schema } from "mongoose"

export interface IOrder {
  drinkType: string
  itemName: string
  itemId: mongoose.Types.ObjectId
  price: number
  date: Date
  isReward: boolean
  claimed: boolean
}

export interface IRewardData {
  paid: number
  earned: number
  claimed: number
}

export interface ICustomer extends Document {
  name: string
  phone: string
  orders: IOrder[]
  totalOrders: number
  rewardsEarned: number
  rewards: Map<string, IRewardData>
  createdAt: Date
  updatedAt: Date
}

const OrderSchema = new Schema<IOrder>({
  drinkType: {
    type: String,
    required: true,
    enum: ["Mojito", "Ice Cream", "Milkshake", "Waffle", "Juice", "Fruit Plate", "Lassi", "Reward"],
  },
  itemName: {
    type: String,
    required: true,
  },
  itemId: {
    type: Schema.Types.ObjectId,
    ref: "MenuItem",
    required: function(this: IOrder) {
      return !this.isReward;
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
  claimed: {
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
  rewards: {
    type: Map,
    of: {
      paid: { type: Number, default: 0 },      // count of paid drinks
      earned: { type: Number, default: 0 },    // rewards unlocked
      claimed: { type: Number, default: 0 }    // rewards claimed
    },
    default: {},
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