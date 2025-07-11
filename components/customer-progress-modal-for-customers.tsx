"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Award,
  Gift,
  MessageCircle,
  Target,
  Coffee,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

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

interface CustomerProgressModalProps {
  customer: RewardCustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: (customer: RewardCustomer, category: CategoryReward) => void;
  onSendWhatsApp: (customer: RewardCustomer, category: CategoryReward) => void;
}

export function CustomerProgressModalForCustomers({
  customer,
  isOpen,
  onClose,
  onClaimReward,
  onSendWhatsApp,
}: CustomerProgressModalProps) {
  if (!customer) return null;

  const [showClaimInfo, setShowClaimInfo] = useState(false);

  const getCardStyle = (status: string) => {
    switch (status) {
      case "earned":
        return "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200";
      case "ready":
        return "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200";
      case "upcoming":
        return "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200";
      default:
        return "bg-gradient-to-br from-red-50 to-rose-50 border-red-200";
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-gray-600" />
              <div>
                <DialogTitle className="text-xl">{customer.name}</DialogTitle>
                <DialogDescription className="text-sm">
                  {customer.phone} • {customer.totalOrders} orders
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {customer.totalPaidDrinks}
              </div>
              <div className="text-sm text-gray-600">Total Drinks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {customer.totalRewardsEarned}
              </div>
              <div className="text-sm text-gray-600">Rewards Earned</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {customer.rewards?.filter(r => r.status === "ready").length || 0}
              </div>
              <div className="text-sm text-gray-600">Ready to Claim</div>
            </div>
          </div>

          {/* Category Progress */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Drink Progress by Category
            </h3>
            
            {customer.rewards && customer.rewards.length > 0 ? (
              <div className="grid gap-4 grid-cols-2">
                {customer.rewards.map((category, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getCardStyle(category.status)}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(category.category)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {category.category}
                          </h4>
                          <p className="text-sm text-gray-600 capitalize">
                            {category.status} status
                          </p>
                        </div>
                      </div>
                      {getStatusIcon(category.status)}
                    </div>

                    {/* Progress Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-white/50 rounded">
                        <div className="text-sm font-bold text-gray-800">
                          {category.paid}
                        </div>
                        <div className="text-xs text-gray-600">Paid</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 rounded">
                        <div className="text-sm font-bold text-blue-600">
                          {category.earned}
                        </div>
                        <div className="text-xs text-gray-600">Earned</div>
                      </div>
                      <div className="text-center p-2 bg-white/50 rounded">
                        <div className="text-sm font-bold text-green-600">
                          {category.claimed}
                        </div>
                        <div className="text-xs text-gray-600">Claimed</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progress to Next Reward</span>
                        <span className="text-sm text-gray-500">
                          {category.status === "ready"
                            ? "5/5"
                            : `${category.progress}/5`}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
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

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {category.status === "ready" && (
                        <Button
                          onClick={() => setShowClaimInfo(true)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          <Gift className="h-4 w-4 mr-1" />
                          Claim Reward
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No category rewards yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  This customer hasn't earned any rewards yet
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
      {/* Claim Info Modal */}
      <Dialog open={showClaimInfo} onOpenChange={setShowClaimInfo}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle>Visit our shop to claim the reward.</DialogTitle>
          </DialogHeader>
          <Button onClick={() => setShowClaimInfo(false)} className="mt-4 w-full">Close</Button>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
} 