"use client";

export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApiUrl } from "@/lib/config";
import {
  Award,
  Gift,
  MessageCircle,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface RewardCustomer {
  _id: string;
  name: string;
  phone: string;
  totalOrders: number;
  paidDrinks: number;
  rewardsEarned: number;
  status: "earned" | "upcoming" | "progress" | "ready";
  drinksUntilReward: number;
  progressTowardReward: number;
}

export default function RewardsPage() {
  const [rewardCustomers, setRewardCustomers] = useState<RewardCustomer[]>([]);
  const [stats, setStats] = useState({
    totalRewardsGiven: 0,
    customersWithRewards: 0,
    upcomingRewards: 0,
    readyRewards: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Fetching rewards from:', getApiUrl('api/rewards'));
      const response = await fetch(getApiUrl('api/rewards'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Received rewards data:', data);
      
      // Check if data has the expected structure
      if (!data || !data.customers || !Array.isArray(data.customers)) {
        console.error('❌ Invalid data structure:', data);
        throw new Error('Invalid data structure received from server');
      }
  
      // Use the data directly from the backend - don't override the status
      setRewardCustomers(data.customers);
      setStats(data.stats || {
        totalRewardsGiven: 0,
        customersWithRewards: 0,
        upcomingRewards: 0,
        readyRewards: 0,
      });
    } catch (error) {
      console.error("❌ Failed to fetch reward data:", error);
      setError(error instanceof Error ? error.message : 'Failed to fetch reward data');
      // Set empty data to prevent UI errors
      setRewardCustomers([]);
      setStats({
        totalRewardsGiven: 0,
        customersWithRewards: 0,
        upcomingRewards: 0,
        readyRewards: 0,
      });
    } finally {
      setLoading(false);
    }
  };
  
  
  

  const sendWhatsAppReminder = (customer: RewardCustomer) => {
    const message = `Hi ${customer.name}, You're just ${
      customer.drinksUntilReward
    } drink${
      customer.drinksUntilReward > 1 ? "s" : ""
    } away from a free reward! Visit us soon.Keep the streak going and claim your free drink! 💥  
We can't wait to see you again 😊`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${
      customer.phone
    }&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const claimReward = async (customer: RewardCustomer) => {
    try {
      const response = await fetch(getApiUrl('api/customers/purchase'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customer.name,
          customerPhone: customer.phone,
          drinkType: 'Reward',
          itemId: null,
          itemName: 'Free Reward',
          price: 0,
          isReward: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to claim reward');
      }

      // Refresh the rewards data
      await fetchRewards();
    } catch (error) {
      console.error('Error claiming reward:', error);
      alert('Failed to claim reward. Please try again.');
    }
  };

  const earnedRewards = rewardCustomers.filter((c) => c.status === "earned");
  const upcomingRewards = rewardCustomers.filter(
    (c) => c.status === "upcoming"
  );
  const progressCustomers = rewardCustomers.filter(
    (c) => c.status === "progress"
  );
  const readyRewards = rewardCustomers.filter(
    (c) => c.status === "ready"
  );

  const getCardStyle = (status: string) => {
    switch (status) {
      case "earned":
        return "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-green-100";
      case "ready":
        return "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-blue-100";
      case "upcoming":
        return "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 hover:shadow-yellow-100";
      default:
        return "bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:shadow-red-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "earned":
        return <Award className="h-5 w-5 text-green-600" />;
      case "ready":
        return <Gift className="h-5 w-5 text-blue-600" />;
      case "upcoming":
        return <Target className="h-5 w-5 text-yellow-600" />;
      default:
        return <Users className="h-5 w-5 text-red-600" />;
    }
  };

  // const getStatusBadge = (status: string, drinksToReward: number) => {
  //   switch (status) {
  //     case "earned":
  //       return (
  //         <Badge className="bg-green-600 hover:bg-green-700">
  //           🎉 Reward Ready
  //         </Badge>
  //       );
  //     case "upcoming":
  //       return (
  //         <Badge className="bg-yellow-600 hover:bg-yellow-700">
  //           ⚡ Almost There
  //         </Badge>
  //       );
  //     default:
  //       return (
  //         <Badge className="bg-red-600 hover:bg-red-700">
  //           {drinksToReward} drinks needed
  //         </Badge>
  //       );
  //   }
  // };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rewards Management</h1>
        <p className="text-gray-600">
          Track customer rewards with visual progress indicators
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="text-red-600">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Loading Rewards</h3>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <button 
                onClick={fetchRewards}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading rewards data...</p>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && !error && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">
                  Total Rewards Given
                </CardTitle>
                <Gift className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700">
                  {stats.totalRewardsGiven}
                </div>
                <p className="text-xs text-purple-600">Free drinks distributed</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">
                  Ready to Claim
                </CardTitle>
                <Gift className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {stats.readyRewards || 0}
                </div>
                <p className="text-xs text-blue-600">Can claim free drinks</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-800">
                  Customers with Rewards
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-700">
                  {stats.customersWithRewards}
                </div>
                <p className="text-xs text-emerald-600">Have earned rewards</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">
                  Upcoming Rewards
                </CardTitle>
                <MessageCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">
                  {stats.upcomingRewards}
                </div>
                <p className="text-xs text-orange-600">Close to earning rewards</p>
              </CardContent>
            </Card>
          </div>

          {/* Category Headers with Counts */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-green-800">
                  Reward Ready
                </h3>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {earnedRewards.length}
              </p>
              <p className="text-sm text-green-600">customers</p>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-800">
                  Ready to Claim
                </h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {readyRewards.length}
              </p>
              <p className="text-sm text-blue-600">customers</p>
            </div>

            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="h-6 w-6 text-yellow-600" />
                <h3 className="text-lg font-semibold text-yellow-800">
                  Almost There
                </h3>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {upcomingRewards.length}
              </p>
              <p className="text-sm text-yellow-600">customers</p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">In Progress</h3>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {progressCustomers.length}
              </p>
              <p className="text-sm text-red-600">customers</p>
            </div>
          </div>

          {/* All Customers in One Grid */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              All Customers by Reward Status
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rewardCustomers.map((customer) => (
                <Card
                  key={customer._id}
                  className={`transition-all duration-200 hover:shadow-lg ${getCardStyle(
                    customer.status
                  )}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(customer.status)}
                        <div>
                          <CardTitle className="text-base">
                            {customer.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {customer.phone}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendWhatsAppReminder(customer)}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Paid Drinks</span>
                      <Badge variant="secondary" className="font-bold">
                        {customer.paidDrinks}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Free Drinks</span>
                      <Badge variant="secondary" className="font-bold">
                      {customer.rewardsEarned}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Progress</span>
                        <span className="text-xs text-gray-500">
                          {customer.status === "ready"
                            ? "5/5"
                            : `${customer.progressTowardReward}/5`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            customer.status === "ready"
                              ? "bg-blue-600"
                              : customer.status === "upcoming"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width:
                              customer.status === "ready"
                                ? "100%"
                                : `${(customer.progressTowardReward / 5) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs font-medium text-gray-700">
                        {customer.status === "ready" 
                          ? "🎁 Ready to claim free drink!"
                          : customer.status === "upcoming"
                          ? `Just ${customer.drinksUntilReward} more drink${customer.drinksUntilReward > 1 ? "s" : ""}!`
                          : customer.rewardsEarned > 0
                          ? `🎉 Previously claimed ${customer.rewardsEarned} free drink${customer.rewardsEarned > 1 ? "s" : ""}`
                          : `${customer.drinksUntilReward} drinks to go`
                        }
                      </p>
                    </div>

                    {/* Claim Reward Button */}
                    {customer.status === "ready" && (
                      <Button
                        onClick={() => claimReward(customer)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        size="sm"
                      >
                        🎁 Claim Free Reward
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
