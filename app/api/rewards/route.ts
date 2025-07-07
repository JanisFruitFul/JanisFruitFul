import connectDB from "@/app/lib/mongodb";
import Customer from "@/backend/models/Customer";
import { NextResponse } from "next/server";

// Simple timeout wrapper
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
    )
  ]);
}

export async function GET(req: Request) {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn("MONGODB_URI not set, returning empty rewards data");
      return NextResponse.json({
        customers: [],
        stats: {
          totalRewardsGiven: 0,
          customersWithRewards: 0,
          upcomingRewards: 0,
          readyRewards: 0,
        },
      });
    }

    // Support filtering by mobile number
    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get("mobile");

    if (mobile) {
      try {
        // Try to connect and query with strict timeout
        await withTimeout(connectDB(), 5000);
        
        const customer = await withTimeout(
          Customer.findOne({ phone: mobile }).maxTimeMS(3000).lean(),
          6000
        );
        
        if (!customer) {
          return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }
        
        // Build category progress as in the original code
        const categoryProgress = [];
        if (customer.rewards && customer.rewards.size > 0) {
          for (const [category, data] of customer.rewards.entries()) {
            const pendingRewards = data.earned - data.claimed;
            const progress = data.paid % 5;
            const drinksUntilReward = progress === 0 && data.paid > 0 ? 0 : 5 - progress;
            let status;
            if (data.paid <= 0) {
              status = "progress";
            } else if (pendingRewards > 0) {
              status = "ready";
            } else if (progress >= 4) {
              status = "upcoming";
            } else {
              status = "progress";
            }
            categoryProgress.push({
              category,
              paid: data.paid,
              earned: data.earned,
              claimed: data.claimed,
              pending: pendingRewards,
              progress,
              drinksUntilReward,
              status,
            });
          }
        }
        const totalPaidDrinks = customer.orders.filter((order: any) => !order.isReward).length;
        const totalRewardsEarned = customer.rewardsEarned || 0;
        return NextResponse.json({
          customer: {
            _id: customer._id,
            name: customer.name,
            phone: customer.phone,
            totalOrders: customer.totalOrders,
            totalPaidDrinks,
            totalRewardsEarned,
            orders: customer.orders,
            rewards: categoryProgress,
          },
        });
      } catch (timeoutError) {
        console.error("Database timeout, returning error:", timeoutError);
        return NextResponse.json({ 
          error: "Database is currently slow. Please try again in a few moments." 
        }, { status: 503 });
      }
    }

    // Default: return all customers (original logic)
    try {
      await withTimeout(connectDB(), 5000);
      const customers = await withTimeout(
        Customer.find({}).maxTimeMS(5000).lean(),
        8000
      );

      // Process customers for reward status with per-category tracking
      const rewardCustomers = customers.map((customer) => {
        const categoryProgress = [];

        // Process each category in the rewards map
        if (customer.rewards && customer.rewards.size > 0) {
          for (const [category, data] of customer.rewards.entries()) {
            const pendingRewards = data.earned - data.claimed;
            const progress = data.paid % 5;
            const drinksUntilReward = progress === 0 && data.paid > 0 ? 0 : 5 - progress;
            
            let status: "earned" | "upcoming" | "progress" | "ready";
            if (data.paid <= 0) {
              status = "progress";
            } else if (pendingRewards > 0) {
              status = "ready";
            } else if (progress >= 4) {
              status = "upcoming";
            } else {
              status = "progress";
            }

            categoryProgress.push({
              category,
              paid: data.paid,
              earned: data.earned,
              claimed: data.claimed,
              pending: pendingRewards,
              progress,
              drinksUntilReward,
              status,
            });
          }
        }

        // Calculate overall stats for backward compatibility
        const totalPaidDrinks = customer.orders.filter((order: any) => !order.isReward).length;
        const totalRewardsEarned = customer.rewardsEarned || 0;

        return {
          _id: customer._id,
          name: customer.name,
          phone: customer.phone,
          totalOrders: customer.totalOrders,
          totalPaidDrinks,
          totalRewardsEarned,
          rewards: categoryProgress,
        };
      });

      // Calculate overall stats
      const totalRewardsGiven = customers.reduce((sum, customer) => sum + (customer.rewardsEarned || 0), 0);
      const customersWithRewards = customers.filter((customer) => (customer.rewardsEarned || 0) > 0).length;
      
      // Count ready and upcoming rewards across all categories
      let totalReadyRewards = 0;
      let totalUpcomingRewards = 0;
      
      rewardCustomers.forEach(customer => {
        customer.rewards.forEach((category: any) => {
          if (category.status === "ready") totalReadyRewards += category.pending;
          if (category.status === "upcoming") totalUpcomingRewards += 1;
        });
      });

      return NextResponse.json({
        customers: rewardCustomers,
        stats: {
          totalRewardsGiven,
          customersWithRewards,
          upcomingRewards: totalUpcomingRewards,
          readyRewards: totalReadyRewards,
        },
      })
    } catch (timeoutError) {
      console.error("Database timeout, returning error:", timeoutError);
      return NextResponse.json({ 
        error: "Database is currently slow. Please try again in a few moments." 
      }, { status: 503 });
    }
  } catch (error) {
    console.error("Failed to fetch reward data:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch reward data" }, { status: 500 })
  }
}
