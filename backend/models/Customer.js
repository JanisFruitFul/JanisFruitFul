const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: function() {
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
});

const CustomerSchema = new mongoose.Schema({
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
});

// Update totalOrders before saving
CustomerSchema.pre("save", function (next) {
  this.totalOrders = this.orders.length;
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.models.Customer || mongoose.model("Customer", CustomerSchema); 