import mongoose, { type Document, Schema } from "mongoose"

export interface IShop extends Document {
  name: string
  phone: string
  email: string
  address: string
  established: string
  license: string
  createdAt: Date
}

const ShopSchema = new Schema<IShop>({
  name: {
    type: String,
    required: true,
    default: "Mojito Paradise",
  },
  phone: {
    type: String,
    required: true,
    default: "+91 98765 43210",
  },
  email: {
    type: String,
    required: true,
    default: "contact@mojitoparadise.com",
  },
  address: {
    type: String,
    required: true,
    default: "123 Beach Road, Goa 403001, India",
  },
  established: {
    type: String,
    default: "2023",
  },
  license: {
    type: String,
    default: "FSSAI-12345678901234",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Shop || mongoose.model<IShop>("Shop", ShopSchema) 