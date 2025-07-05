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
  Coffee,
} from "lucide-react";
import { useEffect, useState } from "react";

interface CategoryReward {
  category: string;
  paid: number;
  earned: number;
  claimed: number;
  pending: number;
  progress: number;
  drinksUntilReward: number;
  status: "earned" | "upcoming" | "progress" | "ready";
}

interface RewardCustomer {
  _id: string;
  name: string;
  phone: string;
  totalOrders: number;
  totalPaidDrinks: number;
  totalRewardsEarned: number;
  rewards: CategoryReward[];
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

  const sendWhatsAppReminder = (customer: RewardCustomer, category: CategoryReward) => {
    const message = `Hi ${customer.name}, You're just ${
      category.drinksUntilReward
    } ${category.category} drink${
      category.drinksUntilReward > 1 ? "s" : ""
    } away from a free reward! Visit us soon to claim your free ${category.category}. Keep the streak going! 💥  
We can't wait to see you again 😊`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${
      customer.phone
    }&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const claimReward = async (customer: RewardCustomer, category: CategoryReward) => {
    try {
      console.log('🎁 Attempting to claim reward:', {
        customerId: customer._id,
        customerName: customer.name,
        category: category.category,
        pending: category.pending
      });

      const apiUrl = getApiUrl(`api/customers/${customer._id}/claim-reward`);
      console.log('🌐 Claim reward URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category.category
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Claim reward failed:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Claim reward successful:', result);

      // Refresh the rewards data
      await fetchRewards();
    } catch (error) {
      console.error('❌ Error claiming reward:', error);
      alert(`Failed to claim reward: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

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
        return <Coffee className="h-5 w-5 text-red-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "mojito":
        return "🍹";
      case "ice cream":
        return "🍦";
      case "milkshake":
        return "🥤";
      case "waffle":
        return "🧇";
      case "juice":
        return "🍊";
      case "fruit plate":
        return "🍎";
      case "lassi":
        return "🥛";
      default:
        return "☕";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rewards Management</h1>
        <p className="text-gray-600">
          Track customer rewards by category with visual progress indicators
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

          {/* All Customers with Category Rewards */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              All Customers by Category Rewards
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rewardCustomers.map((customer) => (
                <Card
                  key={customer._id}
                  className="transition-all duration-200 hover:shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-gray-600" />
                        <div>
                          <CardTitle className="text-base">
                            {customer.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {customer.phone}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Drinks</span>
                      <Badge variant="secondary" className="font-bold">
                        {customer.totalPaidDrinks}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Rewards</span>
                      <Badge variant="secondary" className="font-bold">
                        {customer.totalRewardsEarned}
                      </Badge>
                    </div>

                    {/* Category Rewards */}
                    {customer.rewards && customer.rewards.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Category Progress:</h4>
                        {customer.rewards.map((category, index) => (
                          <div key={index} className={`p-2 rounded-lg ${getCardStyle(category.status)}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-1">
                                <span className="text-lg">{getCategoryIcon(category.category)}</span>
                                <span className="text-sm font-medium">{category.category}</span>
                              </div>
                              {getStatusIcon(category.status)}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Paid: {category.paid}</span>
                                <span>Earned: {category.earned}</span>
                                <span>Claimed: {category.claimed}</span>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs">Progress</span>
                                  <span className="text-xs text-gray-500">
                                    {category.status === "ready"
                                      ? "5/5"
                                      : `${category.progress}/5`}
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${
                                      category.status === "ready"
                                        ? "bg-blue-600"
                                        : category.status === "upcoming"
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{
                                      width:
                                        category.status === "ready"
                                          ? "100%"
                                          : `${(category.progress / 5) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="text-center p-1 bg-white/50 rounded text-xs">
                                {category.status === "ready" 
                                  ? `🎁 Ready to claim ${category.pending} free ${category.category}!`
                                  : category.status === "upcoming"
                                  ? `Just ${category.drinksUntilReward} more ${category.category}!`
                                  : `${category.drinksUntilReward} ${category.category} to go`
                                }
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-1 mt-2">
                                {category.status === "ready" && (
                                  <Button
                                    onClick={() => claimReward(customer, category)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                                    size="sm"
                                  >
                                    Claim
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => sendWhatsAppReminder(customer, category)}
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                >
                                  <MessageCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">No category rewards yet</p>
                      </div>
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
