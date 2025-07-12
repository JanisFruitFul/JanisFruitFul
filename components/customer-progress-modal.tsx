"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Award,
  Gift,
  Target,
  Coffee,
  Users,
  X,
} from "lucide-react";

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

export function CustomerProgressModal({
  customer,
  isOpen,
  onClose,
  onClaimReward,
  onSendWhatsApp,
}: CustomerProgressModalProps) {
  if (!customer) return null;

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
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-y-auto rounded-xl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 border-b flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-gray-600" />
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold">{customer.name}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-gray-500">
                {customer.phone} • {customer.totalOrders} orders
              </DialogDescription>
            </div>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-200"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6 px-4 py-4">
          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-2">
            <div className="flex flex-col items-center bg-gray-50 rounded-lg p-2 sm:p-4">
              <span className="text-base sm:text-2xl font-bold text-gray-900">
                {customer.totalPaidDrinks}
              </span>
              <span className="text-xs sm:text-sm text-gray-600">Drinks</span>
            </div>
            <div className="flex flex-col items-center bg-blue-50 rounded-lg p-2 sm:p-4">
              <span className="text-base sm:text-2xl font-bold text-blue-600">
                {customer.totalRewardsEarned}
              </span>
              <span className="text-xs sm:text-sm text-blue-700">Rewards</span>
            </div>
            <div className="flex flex-col items-center bg-green-50 rounded-lg p-2 sm:p-4">
              <span className="text-base sm:text-2xl font-bold text-green-600">
                {customer.rewards?.filter(r => r.status === "ready").length || 0}
              </span>
              <span className="text-xs sm:text-sm text-green-700">Ready</span>
            </div>
          </div>

          {/* Category Progress */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
              Drink Progress by Category
            </h3>
            {customer.rewards && customer.rewards.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {customer.rewards.map((category, index) => (
                  <div
                    key={index}
                    className={`p-3 sm:p-4 rounded-xl border shadow-sm flex flex-col gap-2 ${getCardStyle(category.status)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl">{getCategoryIcon(category.category)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                            {category.category}
                          </h4>
                          <span className="inline-block text-[11px] sm:text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 capitalize">
                            {category.status}
                          </span>
                        </div>
                      </div>
                      {getStatusIcon(category.status)}
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium">Progress</span>
                        <span className="text-xs text-gray-500">
                          {category.status === "ready" ? "5/5" : `${category.progress}/5`}
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

                    {/* Progress Stats */}
                    <div className="flex justify-between text-center text-xs mb-1">
                      <div className="flex-1">
                        <div className="font-bold text-gray-800">{category.paid}</div>
                        <div className="text-gray-500">Paid</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-blue-600">{category.earned}</div>
                        <div className="text-gray-500">Earned</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-green-600">{category.claimed}</div>
                        <div className="text-gray-500">Claimed</div>
                      </div>
                    </div>

                    {/* Status Message */}
                    <div className="text-center p-2 bg-white/60 rounded mb-1 text-xs font-medium">
                      {category.status === "ready"
                        ? `🎁 Ready to claim ${category.pending} free ${category.category}!`
                        : category.status === "upcoming"
                        ? `Just ${category.drinksUntilReward} more ${category.category} to go!`
                        : `${category.drinksUntilReward} ${category.category}'s needed`}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                      {category.status === "ready" && (
                        <Button
                          onClick={() => onClaimReward(customer, category)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
                          size="sm"
                        >
                          <Gift className="h-4 w-4 mr-1" />
                          Claim
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onSendWhatsApp(customer, category)}
                        className="flex-1 text-green-600 border-green-600 hover:bg-green-50 text-xs sm:text-sm"
                      >
                        <Gift className="h-4 w-4 mr-1" />
                        Remind
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No category rewards yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  This customer hasn&apos;t earned any rewards yet
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 