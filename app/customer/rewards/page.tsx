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
import { Input } from "@/components/ui/input";
import { getApiUrl } from "@/lib/config";
import {
  Gift,
  Users,
  Coffee,
  Eye,
  Search,
  X,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CustomerProgressModalForCustomers } from "@/components/customer-progress-modal-for-customers";
import Link from "next/link";
import { toast } from "@/components/ui/use-toast";

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
  const [filteredCustomers, setFilteredCustomers] = useState<RewardCustomer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<RewardCustomer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRewards();
  }, []);

  // Filter customers based on active search query
  useEffect(() => {
    if (!activeSearch.trim()) {
      setFilteredCustomers([]);
    } else {
      const searchTerm = activeSearch.trim();
      const isPhoneSearch = /^\d+$/.test(searchTerm); // Check if search is only digits
      if (!isPhoneSearch) {
        setFilteredCustomers([]); // Do not show results for name search
        return;
      }
      // Find the length of phone numbers in the data (assuming all are the same length)
      const phoneLength = rewardCustomers.length > 0 ? rewardCustomers[0].phone.replace(/\D/g, '').length : 10;
      const searchDigits = searchTerm.replace(/\D/g, '');
      if (searchDigits.length !== phoneLength) {
        setFilteredCustomers([]); // Only show if search term length matches phone number length
        return;
      }
      const filtered = rewardCustomers.filter(customer => {
        const customerPhoneDigits = customer.phone.replace(/\D/g, '');
        return customerPhoneDigits === searchDigits;
      });
      setFilteredCustomers(filtered);
    }
  }, [activeSearch, rewardCustomers]);

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
        // Invalid data structure
        return
      }
  
      setRewardCustomers(data.customers);
    } catch {
      // Failed to fetch reward data
      toast({
        title: "Error",
        description: "Failed to fetch reward data",
        variant: "destructive",
      })
    } finally {
      setLoading(false);
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

  const handleSearch = () => {
    setActiveSearch(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Gift className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4">
                Check Your Rewards Here
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Discover your loyalty rewards, track your progress, and claim your free drinks! 
                Every purchase brings you closer to amazing rewards.
              </p>
              <Button asChild variant="outline" size="lg" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white text-xl px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Link href="#find-rewards">
                  Enter Number
                </Link>
              </Button>
            </div>

            {/* Reward Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-green-100">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4 mx-auto">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  500+
                </h3>
                <p className="text-green-600 font-medium">Happy Customers</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-green-100">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4 mx-auto">
                  <Gift className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  200+
                </h3>
                <p className="text-green-600 font-medium">Rewards Given</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-green-100">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4 mx-auto">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  4.8
                </h3>
                <p className="text-green-600 font-medium">Rating</p>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-green-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Search</h3>
                  <p className="text-gray-600 text-sm">Enter your complete mobile number</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">View Progress</h3>
                  <p className="text-gray-600 text-sm">See your rewards progress across all categories</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Claim Rewards</h3>
                  <p className="text-gray-600 text-sm">Claim your free drinks when ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-16">
          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-lg">⚠️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">Error Loading Rewards</h3>
                  <p className="text-sm text-red-600 mb-3">{error}</p>
                  <button 
                    onClick={fetchRewards}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-green-200 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-green-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 mt-4 text-lg font-medium">Loading rewards data...</p>
              <p className="text-gray-400 mt-2 text-sm">Please wait while we fetch the latest information</p>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && (
            <div className="space-y-8">
              {/* Search Section */}
              <div id="find-rewards" className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-green-100 p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      Find Your Rewards
                    </h2>
                    <p className="text-gray-600 text-lg">
                      Enter your complete mobile number to view your rewards
                    </p>
                  </div>
                  
                  {/* Search Input */}
                  <div className="flex gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-96">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Enter complete mobile number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pl-12 pr-4 h-12 text-base border-green-200 focus:border-green-500 focus:ring-green-500 rounded-xl"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      disabled={!searchQuery.trim()}
                      className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Search
                    </Button>
                    {(searchQuery || activeSearch) && (
                      <Button
                        onClick={clearSearch}
                        variant="outline"
                        className="h-12 px-4 bg-white hover:bg-green-50 border-green-200 rounded-xl"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Welcome State - Show when no search is performed */}
              {!activeSearch && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-green-100 p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">Ready to Check Your Rewards?</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto text-lg">
                    Enter your complete mobile number above to discover your loyalty rewards and progress.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>View reward progress</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Cards Grid - Only show when searching */}
              {activeSearch && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                    <Card
                      key={customer._id}
                      className="group relative overflow-hidden bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-green-100 hover:shadow-xl hover:border-green-200 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                      onClick={() => openCustomerModal(customer)}
                    >
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <CardHeader className="relative pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-green-900 transition-colors">
                                {customer.name}
                              </CardTitle>
                              <CardDescription className="text-sm text-gray-600 font-medium">
                                {customer.phone}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-gray-400 group-hover:text-green-500 transition-colors" />
                            <span className="text-xs text-gray-400 group-hover:text-green-500 transition-colors">View</span>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="relative space-y-4">
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs font-medium text-green-700">Total Drinks</span>
                            </div>
                            <div className="text-lg font-bold text-green-800">
                              {customer.totalPaidDrinks}
                            </div>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <span className="text-xs font-medium text-emerald-700">Total Rewards</span>
                            </div>
                            <div className="text-lg font-bold text-emerald-800">
                              {customer.totalRewardsEarned}
                            </div>
                          </div>
                        </div>

                        {/* Categories Section */}
                        {customer.rewards && customer.rewards.length > 0 ? (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                              <span className="w-1 h-4 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></span>
                              Categories
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {customer.rewards.map((category, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className={`text-xs font-medium px-2 py-1 rounded-lg transition-all duration-200 ${
                                    category.status === "ready"
                                      ? "border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                                      : category.status === "upcoming"
                                      ? "border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
                                      : "border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100"
                                  }`}
                                >
                                  <span className="mr-1">{getCategoryIcon(category.category)}</span>
                                  {category.category}
                                </Badge>
                              ))}
                            </div>
                            
                            {/* Ready Rewards Alert */}
                            {customer.rewards.filter(r => r.status === "ready").length > 0 && (
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <Gift className="h-3 w-3 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-green-800">
                                      {customer.rewards.filter(r => r.status === "ready").length} reward(s) ready!
                                    </p>
                                    <p className="text-xs text-green-600">Click to claim</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Coffee className="h-4 w-4 text-gray-500" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">No category rewards yet</p>
                            <p className="text-xs text-gray-400 mt-1">Start ordering to earn rewards</p>
                          </div>
                        )}

                        {/* Action Hint */}
                        <div className="pt-3 border-t border-green-100">
                          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 group-hover:text-green-600 transition-colors">
                            <Eye className="h-3 w-3" />
                            <span>Click to view detailed progress</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : activeSearch ? (
                  <div className="col-span-full">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-green-100 p-12 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="h-8 w-8 text-green-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No customers found</h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        No customers found matching &ldquo;{activeSearch}&rdquo;. Try searching with a different mobile number.
                      </p>
                      <Button
                        variant="outline"
                        onClick={clearSearch}
                        className="flex items-center gap-2 mx-auto bg-white hover:bg-green-50 border-green-200"
                      >
                        <X className="h-4 w-4" />
                        Clear search
                      </Button>
                    </div>
                  </div>
                ) : null}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Customer Progress Modal */}
        <CustomerProgressModalForCustomers
          customer={selectedCustomer}
          isOpen={isModalOpen}
          onClose={closeCustomerModal}
        />
      </div>
    </div>
  );
}
