const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./lib/mongodb');

const app = express();
const port = parseInt(process.env.PORT, 10) || 5001;

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://janis-fruitful.vercel.app', // Your specific Vercel domain
    'https://janis-fruitful-git-main-janis-fruitful.vercel.app', // Preview deployments
    'https://janis-fruitful-git-develop-janis-fruitful.vercel.app', // Other possible preview URLs
    'https://*.vercel.app', // Allow all Vercel preview deployments
    'https://*.onrender.com', // Allow Render deployments
    process.env.FRONTEND_URL // Allow custom frontend URL from environment
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Import models
const Admin = require('./models/Admin');
const Customer = require('./models/Customer');
const MenuItem = require('./models/MenuItem');
const Shop = require('./models/Shop');

// Import cloudinary
const cloudinary = require('./cloudinary');

// Add multer for handling multipart form data
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'JaniFruitful Backend is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'JaniFruitful Backend API',
    version: '1.0.0',
    endpoints: {
      admin: '/api/admin',
      customers: '/api/customers',
      menu: '/api/menu',
      dashboard: '/api/dashboard',
      rewards: '/api/rewards'
    }
  });
});

// Admin routes
app.post('/api/admin/login', async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    const token = jwt.sign({ adminId: admin._id, email: admin.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: admin._id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get('/api/admin/profile', async (req, res) => {
  try {
    await connectDB();

    // Get admin info (assuming single admin for now)
    const admin = await Admin.findOne({}).select("-password");

    // Get or create shop info
    let shop = await Shop.findOne({});
    if (!shop) {
      shop = new Shop({});
      await shop.save();
    }

    // Get business stats
    const customers = await Customer.find({});
    const totalCustomers = customers.length;
    const totalOrders = customers.reduce((sum, customer) => sum + customer.totalOrders, 0);
    const totalRevenue = customers.reduce((sum, customer) => {
      return (
        sum +
        customer.orders.reduce((orderSum, order) => {
          return orderSum + (order.isReward ? 0 : order.price);
        }, 0)
      );
    }, 0);
    const rewardsGiven = customers.reduce((sum, customer) => sum + customer.rewardsEarned, 0);

    res.json({
      admin: {
        name: admin?.username || "Admin User",
        email: admin?.email || "admin@drinks.com",
        role: admin?.role || "Super Admin",
        joinDate: admin?.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "January 1, 2024",
        lastLogin: admin?.lastLogin ? new Date(admin.lastLogin).toLocaleString() : "Today, 2:30 PM",
      },
      shop: {
        name: shop.name,
        phone: shop.phone,
        email: shop.email,
        address: shop.address,
        established: shop.established,
        license: shop.license,
      },
      stats: {
        totalCustomers,
        totalOrders,
        totalRevenue,
        rewardsGiven,
      },
    });
  } catch (error) {
    console.error("Failed to fetch profile data:", error);
    res.status(500).json({ success: false, message: "Failed to fetch profile data" });
  }
});

// Menu routes
app.get('/api/menu', async (req, res) => {
  try {
    await connectDB();
    const menuItems = await MenuItem.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu:", error);
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

// Menu items management routes
app.get('/api/menu-items', async (req, res) => {
  try {
    await connectDB();
    const menuItems = await MenuItem.find({}).sort({ createdAt: -1 });
    res.json(menuItems);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

app.post('/api/menu-items', upload.single('image'), async (req, res) => {
  try {
    await connectDB();
    
    const { name, category, price, description } = req.body;
    const imageFile = req.file;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: "Name, category, and price are required" });
    }

    let imageUrl = "/placeholder.svg?height=200&width=200";

    // Upload image to Cloudinary if provided
    if (imageFile) {
      try {
        // Convert buffer to base64
        const base64Image = imageFile.buffer.toString('base64');
        const dataURI = `data:${imageFile.mimetype};base64,${base64Image}`;

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'janifruitful/menu-items',
          resource_type: 'auto'
        });

        imageUrl = uploadResult.secure_url;
        console.log('Image uploaded to Cloudinary:', imageUrl);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // Continue with placeholder image if upload fails
      }
    }

    const menuItem = new MenuItem({
      name: name.trim(),
      category,
      price: parseFloat(price),
      image: imageUrl,
      description: description ? description.trim() : "",
      isActive: true
    });

    await menuItem.save();

    res.json({
      success: true,
      message: "Menu item created successfully",
      menuItem,
    });
  } catch (error) {
    console.error("Failed to create menu item:", error);
    res.status(500).json({ success: false, message: "Failed to create menu item" });
  }
});

// Update menu item
app.put('/api/menu-items/:id', upload.single('image'), async (req, res) => {
  try {
    await connectDB();
    
    const { id } = req.params;
    const { name, category, price, description } = req.body;
    const imageFile = req.file;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: "Name, category, and price are required" });
    }

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    let imageUrl = menuItem.image; // Keep existing image if no new one

    // Upload new image to Cloudinary if provided
    if (imageFile) {
      try {
        // Convert buffer to base64
        const base64Image = imageFile.buffer.toString('base64');
        const dataURI = `data:${imageFile.mimetype};base64,${base64Image}`;

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: 'janifruitful/menu-items',
          resource_type: 'auto'
        });

        imageUrl = uploadResult.secure_url;
        console.log('Image uploaded to Cloudinary:', imageUrl);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        // Keep existing image if upload fails
      }
    }

    // Update the menu item
    menuItem.name = name.trim();
    menuItem.category = category;
    menuItem.price = parseFloat(price);
    menuItem.image = imageUrl;
    menuItem.description = description ? description.trim() : "";
    menuItem.updatedAt = new Date();

    await menuItem.save();

    res.json({
      success: true,
      message: "Menu item updated successfully",
      menuItem,
    });
  } catch (error) {
    console.error("Failed to update menu item:", error);
    res.status(500).json({ success: false, message: "Failed to update menu item" });
  }
});

// Toggle menu item availability
app.patch('/api/menu-items/:id/toggle', async (req, res) => {
  try {
    await connectDB();
    
    const { id } = req.params;
    const { isActive } = req.body;

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    menuItem.isActive = isActive;
    menuItem.updatedAt = new Date();
    await menuItem.save();

    res.json({
      success: true,
      message: `Menu item ${isActive ? 'activated' : 'deactivated'} successfully`,
      menuItem,
    });
  } catch (error) {
    console.error("Failed to toggle menu item:", error);
    res.status(500).json({ success: false, message: "Failed to toggle menu item" });
  }
});

// Delete menu item
app.delete('/api/menu-items/:id', async (req, res) => {
  try {
    await connectDB();
    
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    await MenuItem.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete menu item:", error);
    res.status(500).json({ success: false, message: "Failed to delete menu item" });
  }
});

// Customer routes
app.get('/api/customers', async (req, res) => {
  try {
    await connectDB();
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ error: "Failed to fetch customers" });
  }
});

app.post('/api/customers/purchase', async (req, res) => {
  try {
    await connectDB();
    const { customerName, customerPhone, drinkType, itemId, itemName, price, isReward } = req.body;

    if (!customerName || !customerPhone || !drinkType || !itemName || (!isReward && !price)) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let customer = await Customer.findOne({ phone: customerPhone });

    if (!customer) {
      customer = new Customer({
        name: customerName,
        phone: customerPhone,
        orders: []
      });
    }

    const order = {
      drinkType,
      itemName,
      itemId: isReward ? null : itemId,
      price: isReward ? 0 : price,
      date: new Date(),
      isReward: !!isReward
    };

    customer.orders.push(order);

    // Only increment rewardsEarned if this is a reward
    if (isReward) {
      customer.rewardsEarned = (customer.rewardsEarned || 0) + 1;
    }

    await customer.save();

    res.json({
      success: true,
      message: isReward ? "Free reward drink recorded!" : "Purchase recorded successfully",
      customer,
      isReward: !!isReward
    });
  } catch (error) {
    console.error("Error recording purchase:", error);
    res.status(500).json({ error: "Failed to record purchase" });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    await connectDB();
    
    const totalCustomers = await Customer.countDocuments();
    const customers = await Customer.find();
    
    const totalDrinksSold = customers.reduce((total, customer) => total + customer.totalOrders, 0);
    
    const upcomingRewards = customers.filter(customer => {
      const regularOrders = customer.orders.filter(order => !order.isReward).length;
      return regularOrders >= 5 && regularOrders % 6 === 5;
    }).length;
    
    const rewardsEarned = customers.reduce((total, customer) => total + customer.rewardsEarned, 0);
    
    // Get recent customers with reward information
    const recentCustomers = await Customer.find()
      .sort({ updatedAt: -1 })
      .limit(10);

    // Process recent customers to include drinks needed
    const processedRecentCustomers = recentCustomers.map((customer) => {
      const paidDrinks = customer.orders.filter(order => !order.isReward).length;
      const effectivePaidDrinks = paidDrinks - (customer.rewardsEarned * 5);
      const progressTowardReward = effectivePaidDrinks % 5;
      const drinksUntilReward = progressTowardReward === 0 && effectivePaidDrinks > 0 ? 0 : 5 - progressTowardReward;
      
      return {
        name: customer.name,
        phone: customer.phone,
        totalOrders: customer.totalOrders,
        drinksUntilReward: drinksUntilReward
      };
    });

    res.json({
      totalCustomers,
      totalDrinksSold,
      upcomingRewards,
      rewardsEarned,
      recentCustomers: processedRecentCustomers
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// Earnings analytics route
app.get('/api/earnings', async (req, res) => {
  try {
    await connectDB();
    const { period = 'month', startDate, endDate } = req.query;
    
    // Get all customers with their orders
    const customers = await Customer.find().populate('orders');
    
    // Calculate date range based on period
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { date: { $gte: today } };
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { date: { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { date: { $gte: monthAgo } };
    } else if (period === 'year') {
      const yearAgo = new Date(now.getFullYear(), 0, 1);
      dateFilter = { date: { $gte: yearAgo } };
    }
    
    // If custom date range is provided
    if (startDate && endDate) {
      dateFilter = { 
        date: { 
          $gte: new Date(startDate), 
          $lte: new Date(endDate) 
        } 
      };
    }
    
    // Calculate total earnings and orders
    let totalEarnings = 0;
    let totalOrders = 0;
    const allOrders = [];
    
    customers.forEach(customer => {
      customer.orders.forEach(order => {
        // Apply date filter
        if (Object.keys(dateFilter).length === 0 || 
            (dateFilter.date.$gte && order.date >= dateFilter.date.$gte) ||
            (dateFilter.date.$lte && order.date <= dateFilter.date.$lte)) {
          
          if (!order.isReward) {
            totalEarnings += order.price;
            totalOrders++;
            allOrders.push({
              ...order.toObject(),
              customerName: customer.name,
              customerPhone: customer.phone
            });
          }
        }
      });
    });
    
    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalEarnings / totalOrders : 0;
    
    // Calculate top customers
    const customerSpending = {};
    customers.forEach(customer => {
      let customerTotal = 0;
      let customerOrders = 0;
      
      customer.orders.forEach(order => {
        if (!order.isReward) {
          if (Object.keys(dateFilter).length === 0 || 
              (dateFilter.date.$gte && order.date >= dateFilter.date.$gte) ||
              (dateFilter.date.$lte && order.date <= dateFilter.date.$lte)) {
            customerTotal += order.price;
            customerOrders++;
          }
        }
      });
      
      if (customerTotal > 0) {
        customerSpending[customer.phone] = {
          name: customer.name,
          phone: customer.phone,
          totalSpent: customerTotal,
          orderCount: customerOrders
        };
      }
    });
    
    const topCustomers = Object.values(customerSpending)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
    
    // Calculate top drinks
    const drinkStats = {};
    allOrders.forEach(order => {
      const key = `${order.itemName}-${order.drinkType}`;
      if (!drinkStats[key]) {
        drinkStats[key] = {
          name: order.itemName,
          category: order.drinkType,
          totalSold: 0,
          totalRevenue: 0
        };
      }
      drinkStats[key].totalSold++;
      drinkStats[key].totalRevenue += order.price;
    });
    
    const topDrinks = Object.values(drinkStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
    
    // Calculate monthly earnings
    const monthlyData = {};
    allOrders.forEach(order => {
      const month = new Date(order.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { earnings: 0, orders: 0 };
      }
      monthlyData[month].earnings += order.price;
      monthlyData[month].orders++;
    });
    
    const monthlyEarnings = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        earnings: data.earnings,
        orders: data.orders
      }))
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .slice(-6); // Last 6 months
    
    // Calculate daily earnings (last 7 days)
    const dailyData = {};
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      last7Days.push(dateStr);
      dailyData[dateStr] = { earnings: 0, orders: 0 };
    }
    
    allOrders.forEach(order => {
      const orderDate = new Date(order.date);
      const dateStr = orderDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      if (dailyData[dateStr]) {
        dailyData[dateStr].earnings += order.price;
        dailyData[dateStr].orders++;
      }
    });
    
    const dailyEarnings = last7Days.map(date => ({
      date,
      earnings: dailyData[date].earnings,
      orders: dailyData[date].orders
    }));
    
    // Calculate yearly earnings
    const yearlyData = {};
    allOrders.forEach(order => {
      const year = new Date(order.date).getFullYear().toString();
      if (!yearlyData[year]) {
        yearlyData[year] = { earnings: 0, orders: 0 };
      }
      yearlyData[year].earnings += order.price;
      yearlyData[year].orders++;
    });
    
    const yearlyEarnings = Object.entries(yearlyData)
      .map(([year, data]) => ({
        year,
        earnings: data.earnings,
        orders: data.orders
      }))
      .sort((a, b) => a.year - b.year);
    
    // Prepare transactions data for the table
    const transactions = allOrders.map(order => ({
      _id: order._id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      itemName: order.itemName,
      drinkType: order.drinkType,
      price: order.price,
      date: new Date(order.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      isReward: order.isReward
    })).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first
    
    res.json({
      totalEarnings,
      totalOrders,
      averageOrderValue,
      topCustomers,
      topDrinks,
      monthlyEarnings,
      dailyEarnings,
      yearlyEarnings,
      transactions
    });
    
  } catch (error) {
    console.error("Error fetching earnings data:", error);
    res.status(500).json({ error: "Failed to fetch earnings data" });
  }
});

// Rewards route
app.get('/api/rewards', async (req, res) => {
  try {
    await connectDB();
    const customers = await Customer.find().sort({ updatedAt: -1 });
    
    // Process customers for reward status (new logic: every 5 paid drinks = 1 free)
    const rewardCustomers = customers.map((customer) => {
      // Calculate paid drinks (excluding free rewards)
      const paidDrinks = customer.orders.filter(order => !order.isReward).length;
      
      // Calculate effective paid drinks (subtract claimed rewards)
      // Each claimed reward "consumes" 5 paid drinks
      const effectivePaidDrinks = paidDrinks - (customer.rewardsEarned * 5);
      
      // Calculate progress toward next reward (every 5 paid drinks = 1 free)
      const progressTowardReward = effectivePaidDrinks % 5;
      const drinksUntilReward = progressTowardReward === 0 && effectivePaidDrinks > 0 ? 0 : 5 - progressTowardReward;
      
      // Determine status
      let status;
      if (effectivePaidDrinks <= 0) {
        status = "progress";
      } else if (progressTowardReward === 0 && effectivePaidDrinks > 0) {
        // Show "ready" when they have exactly 5 effective paid drinks (or multiples of 5)
        status = "ready"; // Ready to claim reward
      } else if (progressTowardReward >= 4) {
        status = "upcoming";
      } else {
        status = "progress";
      }

      return {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone,
        totalOrders: customer.totalOrders,
        paidDrinks: paidDrinks,
        rewardsEarned: customer.rewardsEarned,
        status,
        drinksUntilReward,
        progressTowardReward,
      }
    })

    // Calculate stats
    const totalRewardsGiven = customers.reduce((sum, customer) => sum + customer.rewardsEarned, 0);
    const customersWithRewards = customers.filter((customer) => customer.rewardsEarned > 0).length;
    const upcomingRewards = rewardCustomers.filter((customer) => customer.status === "upcoming").length;
    const readyRewards = rewardCustomers.filter((customer) => customer.status === "ready").length;

    res.json({
      customers: rewardCustomers,
      stats: {
        totalRewardsGiven,
        customersWithRewards,
        upcomingRewards,
        readyRewards,
      },
    })
  } catch (error) {
    console.error("Error fetching rewards:", error);
    res.status(500).json({ error: "Failed to fetch rewards data" });
  }
});

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting JaniFruitful Backend Server...');
    console.log('📡 Environment:', process.env.NODE_ENV || 'development');
    console.log('🔗 Port:', port);
    
    await connectDB();
    console.log('✅ MongoDB connected successfully');
    
    app.listen(port, () => {
      console.log(`🎉 Backend server ready on http://localhost:${port}`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      console.log(`🎁 Rewards API: http://localhost:${port}/api/rewards`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    console.error('💡 Make sure your MongoDB URI is correct and the database is accessible');
    process.exit(1);
  }
}

startServer(); 