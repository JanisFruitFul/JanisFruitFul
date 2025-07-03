"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiUrl } from "@/lib/config";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Coffee,
  Cookie,
  GlassWater,
  IceCream,
  Search
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface MenuItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  isActive: boolean;
}

export default function CustomerItemsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [apiStatus, setApiStatus] = useState<string>("Loading...");

  useEffect(() => {
    console.log('🚀 Customer items page mounted');
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setApiStatus("Fetching menu items...");
      
      const response = await fetch(getApiUrl('api/menu'));
      console.log('📡 Menu response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Menu items received:', data.length, 'items');
        
        setMenuItems(data);
        setApiStatus(`✅ Loaded ${data.length} items`);
      } else {
        console.error("Failed to fetch menu items");
        setMenuItems([]);
        setApiStatus("❌ Failed to fetch menu items");
      }
    } catch (err) {
      console.error("Error fetching menu items:", err);
      setMenuItems([]);
      setApiStatus(`❌ Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mojito':
        return <Coffee className="h-5 w-5" />;
      case 'ice cream':
        return <IceCream className="h-5 w-5" />;
      case 'milkshake':
        return <GlassWater className="h-5 w-5" />;
      case 'waffle':
        return <Cookie className="h-5 w-5" />;
      default:
        return <Coffee className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mojito':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'ice cream':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'milkshake':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'waffle':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Filter items based on category and search query
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === "all" || 
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["all", ...Array.from(new Set(menuItems.map(item => item.category)))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-white/20"
                asChild
              >
                <Link href="/customer">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Customer Portal
                </Link>
              </Button>
            </div>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold">
                Our Menu
              </h1>
              <p className="text-emerald-100 text-sm sm:text-base">
                Browse our delicious selection
              </p>
            </div>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Search and Filter Section */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Search className="h-6 w-6 text-emerald-600" />
              Search & Filter
            </CardTitle>
            <CardDescription>
              Find your favorite items by searching or filtering by category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search items by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>

            {/* Category Filter */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Filter by Category:</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize text-sm"
                    size="sm"
                  >
                    {category === "all" ? "All Items" : category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items Grid */}
        {loading ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading menu items...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Showing {filteredMenuItems.length} of {menuItems.length} items
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSearchQuery("")}
                >
                  Clear Search
                </Button>
              )}
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMenuItems.map((item) => (
                <Card key={item._id} className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="w-52 h-52 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${item.image ? 'hidden' : ''}`}>
                          {getCategoryIcon(item.category)}
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                        {item.name}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-4">
                        <Badge 
                          variant="outline" 
                          className={`${getCategoryColor(item.category)} border`}
                        >
                          {item.category}
                        </Badge>
                        <span className="font-bold text-lg text-emerald-600">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-center">
                        {item.isActive ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Available</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-red-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm font-medium">Unavailable</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {!loading && filteredMenuItems.length === 0 && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Coffee className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-500">
                    {searchQuery 
                      ? `No items match "${searchQuery}" in the ${selectedCategory === "all" ? "menu" : selectedCategory} category.`
                      : `No items available in the ${selectedCategory} category.`
                    }
                  </p>
                  {(searchQuery || selectedCategory !== "all") && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* CTA Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Order?
            </h3>
            <p className="text-emerald-100 text-lg mb-6 max-w-2xl mx-auto">
              Visit our shop to place your order and start earning rewards! 
              Every 5 drinks you buy, get your 6th drink absolutely FREE.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold"
                asChild
              >
                <Link href="/">
                  Visit Our Shop
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-black font-semibold"
                asChild
              >
                <Link href="/customer">
                  Back to Customer Portal
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 