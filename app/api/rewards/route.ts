export const dynamic = "force-dynamic";
import connectDB from "@/app/lib/mongodb";
import Customer from "@/backend/models/Customer";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/server-auth";

interface Order {
  isReward: boolean
}

interface CategoryData {
  paid: number
  earned: number
  claimed: number
  status: string
}

// Simple timeout wrapper
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error("Operation timed out")), timeoutMs)
    )
  ]);
}

export async function GET(req: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      // MONGODB_URI not set, returning empty rewards data
      return NextResponse.json({ customers: [] })
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
        const totalPaidDrinks = customer.orders.filter((order: Order) => !order.isReward).length;
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
      } catch {
        // Database timeout, returning error
        return NextResponse.json(
          { error: "Database connection timeout" },
          { status: 500 }
        )
      }
    }

    // Default: require authentication for admin access to all customers
    const authResult = await requireAuth(req)
    if ('error' in authResult) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
        const totalPaidDrinks = customer.orders.filter((order: Order) => !order.isReward).length;
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
        customer.rewards.forEach((category: CategoryData) => {
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
    } catch {
      // Database timeout, returning error
      return NextResponse.json(
        { error: "Database connection timeout" },
        { status: 500 }
      )
    }
  } catch {
    // Failed to fetch reward data
    return NextResponse.json(
      { error: "Failed to fetch reward data" },
      { status: 500 }
    )
  }
}
