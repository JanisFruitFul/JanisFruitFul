"use client"

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiUrl } from "@/lib/config";
import {
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast";
// Animation hook for scroll-triggered animations
const useScrollAnimation = (threshold: number = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: threshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );
    observer.observe(ref);
    return () => {
      if (ref) {
        observer.unobserve(ref);
      }
    };
  }, [ref, threshold]);
  return [setRef, isVisible] as const;
};

interface MenuItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  isActive: boolean;
  description?: string;
}

export default function CustomerItemsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [heroRef, heroVisible] = useScrollAnimation();
  const [menuRef, menuVisible] = useScrollAnimation();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showApologyModal, setShowApologyModal] = useState(false);
  const [serverBusy, setServerBusy] = useState(false);

  useEffect(() => {
    fetchMenuItems();
    // Check if user has seen the apology modal before
    const hasSeenApology = localStorage.getItem('hasSeenApologyModal');
    if (!hasSeenApology) {
      setShowApologyModal(true);
    }
  }, []);

  // Reload after 15 seconds if server is busy
  useEffect(() => {
    if (serverBusy) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 20000);
      return () => clearTimeout(timer);
    }
  }, [serverBusy]);

  const handleCloseApologyModal = () => {
    setShowApologyModal(false);
    localStorage.setItem('hasSeenApologyModal', 'true');
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setServerBusy(false);
      
      const response = await fetch(getApiUrl('api/menu'));
      
      if (response.ok) {
        const data = await response.json();
        
        setMenuItems(data);
      } else {
        // Failed to fetch menu items
        toast({
          title: "Error",
          description: "Failed to fetch menu items",
          variant: "destructive",
        })
        setMenuItems([]);
        setServerBusy(true);
      }
    } catch {
      // Error fetching menu items
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      })
      setMenuItems([]);
      setServerBusy(true);
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
      case 'juice':
        return <Coffee className="h-5 w-5" />;
      case 'fruit plate':
        return <Cookie className="h-5 w-5" />;
      case 'lassi':
        return <GlassWater className="h-5 w-5" />;
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
      case 'juice':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'fruit plate':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'lassi':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
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
    <div className="min-h-screen bg-gray-50">
      {/* Item Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) setSelectedItem(null);
      }}>
        <DialogContent>
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getCategoryIcon(selectedItem.category)}
                  {selectedItem.name}
                </DialogTitle>
                <DialogDescription>
                  <span className="capitalize font-medium text-emerald-700">{selectedItem.category}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 mt-2">
                <div className="w-40 h-40 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                  {selectedItem.image ? (
                    <Image
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getCategoryIcon(selectedItem.category)
                  )}
                </div>
                <div className="w-full text-center">
                  <p className="text-lg font-semibold text-emerald-600 mb-1">
                    {formatCurrency(selectedItem.price)}
                  </p>
                  <p className="mb-2 text-gray-700">
                    {selectedItem.isActive ? (
                      <span className="text-green-600 font-medium">Available</span>
                    ) : (
                      <span className="text-red-600 font-medium">Unavailable</span>
                    )}
                  </p>
                  {selectedItem.description && (
                    <div className="bg-gray-50 rounded p-3 border text-gray-800 text-sm whitespace-pre-line">
                      {selectedItem.description}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Apology Modal */}
      <Dialog open={showApologyModal} onOpenChange={setShowApologyModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Coffee className="h-6 w-6 text-orange-500" />
              Important Notice
            </DialogTitle>
            <DialogDescription className="text-base">
              We apologize for any inconvenience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Coffee className="h-4 w-4 text-orange-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 mb-1">Online Ordering Temporarily Unavailable</h3>
                <p className="text-orange-700 text-sm leading-relaxed">
                  Sorry, currently the online ordering is not working but you can check the menu. 
                  Please visit our shop to place your orders and enjoy our delicious drinks!
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleCloseApologyModal}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Got it, thanks!
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCloseApologyModal}
                className="flex-1"
              >
                Continue Browsing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className={`relative bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 py-20 overflow-hidden transition-all duration-1000 ${
          heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-emerald-700 drop-shadow-lg">Explore Our Menu</h1>
          <p className="text-lg sm:text-2xl text-emerald-900/80 font-medium">Delicious drinks, desserts, and more. Find your favorite and order now!</p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
        {/* Search and Filter Section */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Search className="h-6 w-6 text-emerald-600" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Responsive Search & Category Filter */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search items by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              {/* Category Dropdown for mobile, buttons for desktop */}
              <div className="sm:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full capitalize text-sm px-4 py-2 rounded-full font-semibold shadow border-2 bg-white border-gray-200 text-emerald-700 hover:bg-emerald-50 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {getCategoryIcon(selectedCategory)}
                        {selectedCategory === "all" ? "All Items" : selectedCategory}
                      </span>
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {categories.map((category) => (
                      <DropdownMenuItem
                        key={category}
                        onSelect={() => setSelectedCategory(category)}
                        className={`capitalize flex items-center gap-2 ${selectedCategory === category ? 'font-bold text-emerald-600' : ''}`}
                      >
                        {getCategoryIcon(category)}
                        {category === "all" ? "All Items" : category}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* Category Buttons for desktop */}
              <div className="hidden sm:flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={`capitalize text-sm px-4 py-2 rounded-full font-semibold shadow transition-all duration-200 border-2 ${selectedCategory === category ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white border-emerald-400 scale-105' : 'bg-white border-gray-200 text-emerald-700 hover:bg-emerald-50'}`}
                    size="sm"
                  >
                    <span className="mr-2">{getCategoryIcon(category)}</span>
                    {category === "all" ? "All Items" : category}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Menu Items Grid */}
        <section
          ref={menuRef}
          className={`transition-all duration-1000 ${menuVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
        {serverBusy ? (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Coffee className="h-16 w-16 text-orange-400 mx-auto mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-orange-700 mb-2">Server is busy</h3>
              <p className="text-gray-700 text-lg mb-4">
                Our kitchen is a bit busy right now!<br />
                Please wait while we fetch the delicious drinks for you.<br />
                The page will reload automatically in 20 seconds.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Reload Now
              </Button>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="space-y-6">
            {/* Results Summary Skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>
            {/* Items Grid Skeleton */}
            <div className="space-y-8">
              {(selectedCategory === "all" ? categories.filter(c => c !== "all") : [selectedCategory]).map((category) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(category)}
                    <span className="font-semibold text-lg capitalize">{category}</span>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {[...Array(3)].map((_, index) => (
                      <Card key={index} className="border-0 shadow-md min-w-[220px] w-56 flex-shrink-0">
                        <CardContent className="p-6">
                          <div className="text-center">
                            <Skeleton className="w-40 h-40 mx-auto mb-4 rounded-2xl" />
                            <Skeleton className="h-6 w-24 mx-auto mb-2" />
                            <div className="flex items-center justify-between mb-4">
                              <Skeleton className="h-6 w-16" />
                              <Skeleton className="h-6 w-10" />
                            </div>
                            <div className="flex items-center justify-center">
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div className="flex items-center justify-between">
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
            {/* Items by Category, horizontal scroll */}
            <div className="space-y-8">
              {(selectedCategory === "all" ? categories.filter(c => c !== "all") : [selectedCategory])
                .map((category) => {
                  const items = filteredMenuItems.filter(item => item.category === category);
                  if (items.length === 0) return null;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(category)}
                        <span className="font-semibold text-lg capitalize">{category}</span>
                      </div>
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {items.map((item) => (
                          <Card
                            key={item._id}
                            className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md min-w-[220px] w-56 flex-shrink-0 cursor-pointer"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsModalOpen(true);
                            }}
                          >
                            <CardContent className="p-6">
                              <div className="text-center">
                                <div className="w-40 h-40 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                                  {item.image ? (
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      width={160}
                                      height={160}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
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
                    </div>
                  );
                })}
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
        </section>
        {/* CTA Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <CardContent className="p-8 text-center">
            <h3 className="text-3xl font-extrabold mb-4 drop-shadow">Ready to Order?</h3>
            <p className="text-emerald-100 text-lg mb-6 max-w-2xl mx-auto font-medium">
              Visit our shop to place your order and start earning rewards! 
              Every 5 drinks you buy, get your 6th drink absolutely FREE.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-emerald-600 hover:bg-gray-100 font-semibold shadow-lg"
                asChild
              >
                <Link href="/">
                  Visit Our Shop
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-white text-black font-semibold shadow-lg"
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