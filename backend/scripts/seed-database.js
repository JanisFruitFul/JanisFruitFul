const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const MONGODB_URI = process.env.MONGODB_URI

// Define schemas directly in the script
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
  createdAt: { type: Date, default: Date.now },
})

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: "/placeholder.svg?height=200&width=200" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

const ShopSchema = new mongoose.Schema({
  name: { type: String, default: "Mojito Paradise" },
  phone: { type: String, default: "+91 98765 43210" },
  email: { type: String, default: "contact@mojitoparadise.com" },
  address: { type: String, default: "123 Beach Road, Goa 403001, India" },
  established: { type: String, default: "2023" },
  license: { type: String, default: "FSSAI-12345678901234" },
  createdAt: { type: Date, default: Date.now },
})

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI)

    const Admin = mongoose.model("Admin", AdminSchema)
    const MenuItem = mongoose.model("MenuItem", MenuItemSchema)
    const Shop = mongoose.model("Shop", ShopSchema)

    // Clear existing data
    await Admin.deleteMany({})
    await MenuItem.deleteMany({})
    await Shop.deleteMany({})

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 12)
    const admin = new Admin({
      username: "admin",
      email: "admin@drinks.com",
      password: hashedPassword,
      role: "super_admin",
    })
    await admin.save()
    

    await MenuItem.insertMany(menuItems)

    // Create shop info
    const shop = new Shop({})
    await shop.save()


  } catch (error) {
    // Error seeding database
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

seedDatabase() 