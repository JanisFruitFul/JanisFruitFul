"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Coffee, Gift, Star } from "lucide-react";
import Link from "next/link";

export default function CustomerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              Customer Portal
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-emerald-100 max-w-3xl mx-auto">
              Check your rewards, view order history, and manage your account
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-6 py-3">
                <Gift className="h-6 w-6" />
                <span className="font-semibold">Rewards Program</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-6 py-3">
                <Star className="h-6 w-6" />
                <span className="font-semibold">Order History</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Coming Soon Card */}
        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-12 w-12 text-emerald-600" />
            </div>
            <CardTitle className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Coming Soon
            </CardTitle>
            <CardDescription className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're working hard to bring you an amazing customer experience. 
              Soon you'll be able to check your rewards, view your order history, 
              and manage your account all in one place.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center space-y-8">
            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-emerald-50 rounded-xl p-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Rewards Tracking</h3>
                <p className="text-gray-600 text-sm">
                  Track your progress and see when you'll earn your next free drink
                </p>
              </div>
              
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coffee className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Order History</h3>
                <p className="text-gray-600 text-sm">
                  View all your past orders and favorite items
                </p>
              </div>
              
              <div className="bg-purple-50 rounded-xl p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Account Management</h3>
                <p className="text-gray-600 text-sm">
                  Update your profile and manage your preferences
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <p className="text-gray-600 font-medium">
                In the meantime, you can:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                  asChild
                >
                  <Link href="/customer/items">
                    Visit Our Menu
                  </Link>
                </Button>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span>Planning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span>Development</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span>Testing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span>Launch</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 