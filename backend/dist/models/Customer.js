"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const OrderSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: function () {
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
const CustomerSchema = new mongoose_1.Schema({
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
            paid: { type: Number, default: 0 }, // count of paid drinks
            earned: { type: Number, default: 0 }, // rewards unlocked
            claimed: { type: Number, default: 0 } // rewards claimed
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
exports.default = mongoose_1.default.models.Customer || mongoose_1.default.model("Customer", CustomerSchema);
