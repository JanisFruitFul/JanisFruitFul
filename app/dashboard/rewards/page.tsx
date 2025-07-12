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
  Gift,
  MessageCircle,
  TrendingUp,
  Users,
  Eye,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CustomerProgressModal } from "@/components/customer-progress-modal";

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
  const [selectedCustomer, setSelectedCustomer] = useState<RewardCustomer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(getApiUrl('api/rewards'));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
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
    const message = `Hey ${customer.name}! 🎉
You're SO close to unlocking your FREE ${category.category} reward! ${getCategoryIcon(category.category)}✨
Your loyalty streak is amazing and we can't wait to give you your well-deserved treat! 
Come visit us soon and claim your free ${category.category} - you've earned it! 🎁💫
See you at Jani's Fruitful! 😊`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${
      customer.phone
    }&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  const claimReward = async (customer: RewardCustomer, category: CategoryReward) => {
    try {
      const apiUrl = getApiUrl(`api/customers/${customer._id}/claim-reward`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category.category
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Claim reward failed:', errorData);
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Refresh the rewards data
      await fetchRewards();
    } catch (error) {
      console.error('❌ Error claiming reward:', error);
      alert(`Failed to claim reward: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const openCustomerModal = (customer: RewardCustomer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const closeCustomerModal = () => {
    setSelectedCustomer(null);
    setIsModalOpen(false);
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

  const filteredCustomers = rewardCustomers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      customer.name.toLowerCase().includes(query) ||
      customer.phone.toLowerCase().includes(query);

    let matchesStatus = true;
    if (statusFilter === "no-rewards") {
      matchesStatus = !customer.rewards || customer.rewards.length === 0;
    } else if (statusFilter !== "all") {
      matchesStatus =
        customer.rewards &&
        customer.rewards.some((reward) => reward.status === statusFilter);
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
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
          {/* Stats Cards Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Rewards Statistics</h2>
            <Button
              variant="outline"
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2"
            >
              {showStats ? "Hide Stats" : "Show Stats"}
            </Button>
          </div>

          {/* Stats Cards */}
          {showStats && (
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
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
          )}

          {/* Search Bar and Filter */}
          <div className="flex flex-row justify-end gap-2 mb-4 w-full">
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-200 w-[75%] sm:w-auto sm:flex-1"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 min-w-0 focus:outline-none focus:ring-2 focus:ring-blue-200 w-[25%] sm:w-auto sm:flex-1"
            >
              <option value="all">All Statuses</option>
              <option value="ready">Ready</option>
              <option value="upcoming">Upcoming</option>
              <option value="earned">Earned</option>
              <option value="no-rewards">No Rewards</option>
            </select>
          </div>

          {/* All Customers with Category Rewards */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              All Customers by Category Rewards
            </h2>
            <div
              className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-y-auto"
              style={{ maxHeight: '60vh', minHeight: '200px' }}
            >
              {filteredCustomers.map((customer) => (
                <Card
                  key={customer._id}
                  className="transition-all duration-200 hover:shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 cursor-pointer hover:scale-105 p-2 sm:p-4 rounded-lg"
                  onClick={() => openCustomerModal(customer)}
                >
                  <CardHeader className="pb-2 sm:pb-3 px-2 sm:px-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        <div>
                          <CardTitle className="text-sm sm:text-base">
                            {customer.name}
                          </CardTitle>
                          <CardDescription className="text-[10px] sm:text-xs">
                            {customer.phone}
                          </CardDescription>
                        </div>
                      </div>
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3 px-2 sm:px-4 pb-2 sm:pb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-medium">Drinks</span>
                      <Badge variant="secondary" className="font-bold text-xs sm:text-sm px-2">
                        {customer.totalPaidDrinks}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm font-medium">Rewards</span>
                      <Badge variant="secondary" className="font-bold text-xs sm:text-sm px-2">
                        {customer.totalRewardsEarned}
                      </Badge>
                    </div>

                    {/* Quick Category Summary */}
                    <div className="pt-1 sm:pt-2 border-t border-gray-200">
                      <p className="text-[10px] sm:text-xs text-gray-500 text-center">
                        Tap to view progress
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Customer Progress Modal */}
      <CustomerProgressModal
        customer={selectedCustomer}
        isOpen={isModalOpen}
        onClose={closeCustomerModal}
        onClaimReward={claimReward}
        onSendWhatsApp={sendWhatsAppReminder}
      />
    </div>
  );
}
