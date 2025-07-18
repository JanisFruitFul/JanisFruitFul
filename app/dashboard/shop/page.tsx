"use client"

export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/config";
import { Check, Minus, Plus, Search, ShoppingCart, X, User2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";

interface MenuItem {
  _id: string
  name: string
  category: string
  price: number
  image: string
  isActive: boolean
}

interface CartItem extends MenuItem {
  quantity: number
}

// Default categories - will be extended with dynamic categories from database
const defaultCategories = ["Mojito", "Ice Cream", "Milkshake", "Juice", "Fruit Plate", "Lassi"]

export default function ShopPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([])
  const { toast } = useToast()
  const [allCustomers, setAllCustomers] = useState<{ name: string; phone: string }[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<{ name: string; phone: string }[]>([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");

  // Combine default and dynamic categories, removing duplicates
  const categories = [...new Set([...defaultCategories, ...dynamicCategories])]

  const filterAndSortItems = useCallback(() => {
    let filtered = [...menuItems]

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "category":
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

    setFilteredItems(filtered)
  }, [menuItems, searchTerm, selectedCategory, sortBy])

  const fetchMenuItems = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('api/menu'))
      if (response.ok) {
        const data = await response.json()
        const items = Array.isArray(data) ? data : []
        setMenuItems(items)
        
        // Extract unique categories from menu items
        const uniqueCategories = [...new Set(items.map(item => item.category))]
        setDynamicCategories(uniqueCategories)
      } else {
        // Failed to fetch menu items
        toast({
          title: "Error",
          description: "Failed to fetch menu items",
          variant: "destructive",
        })
      }
    } catch {
      // Error fetching menu items
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    fetchMenuItems()
  }, [fetchMenuItems])

  useEffect(() => {
    filterAndSortItems()
  }, [filterAndSortItems])

  // Fetch all customers when checkout modal opens
  useEffect(() => {
    if (showCheckout) {
      fetch(getApiUrl("api/customers"))
        .then((res) => res.json())
        .then((data: { name: string; phone: string }[]) => {
          if (Array.isArray(data)) {
            setAllCustomers(data.map((c) => ({ name: c.name, phone: c.phone })));
          }
        });
    }
  }, [showCheckout]);

  // Filter customers as phone input changes
  useEffect(() => {
    if (customerPhone.length >= 2) {
      const matches = allCustomers.filter(
        (c) =>
          c.phone.includes(customerPhone) ||
          c.name.toLowerCase().includes(customerPhone.toLowerCase())
      );
      setFilteredCustomers(matches);
      setShowCustomerDropdown(matches.length > 0);
    } else {
      setShowCustomerDropdown(false);
    }
  }, [customerPhone, allCustomers]);

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem._id === item._id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem._id === item._id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      } else {
        return [...prevCart, { ...item, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem._id === itemId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem._id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem,
        )
      } else {
        return prevCart.filter((cartItem) => cartItem._id !== itemId)
      }
    })
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getItemQuantity = (itemId: string) => {
    const item = cart.find((cartItem) => cartItem._id === itemId)
    return item ? item.quantity : 0
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to cart before checkout",
        variant: "destructive",
      })
      return
    }
    setShowCheckout(true)
  }

  const handlePurchase = async (item: MenuItem) => {
    try {
      const response = await fetch(getApiUrl('api/customers/purchase'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          drinkType: item.category,
          itemId: item._id,
          itemName: item.name,
          price: item.price,
          isReward: false,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process order")
      }
    } catch {
      // Error processing order
      toast({
        title: "Error",
        description: "Failed to process order",
        variant: "destructive",
      })
    }
  }

  const isCustomerNew = (name: string, phone: string) => {
    return !allCustomers.some(c => c.phone === phone);
  };

  const handleSubmitOrder = async () => {
    if (!customerName || !customerPhone) {
      toast({
        title: "Missing information",
        description: "Please fill in customer name and phone number",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
    const wasNewCustomer = isCustomerNew(customerName, customerPhone);
    try {
      // Process each item in the cart
      for (const cartItem of cart) {
        for (let i = 0; i < cartItem.quantity; i++) {
          await handlePurchase(cartItem);
        }
      }
      toast({
        title: "Order processed successfully!",
        description: `${getTotalItems()} items added for ${customerName}`,
      });
      // Show WhatsApp welcome modal if new customer
      if (wasNewCustomer) {
        setNewCustomerPhone(customerPhone);
        setNewCustomerName(customerName);
        setShowWelcomeModal(true);
      }
      // Reset form and cart
      setCustomerName("");
      setCustomerPhone("");
      clearCart();
      setShowCheckout(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to process order",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const groupedItems = categories.reduce(
    (acc, category) => {
      const categoryItems = filteredItems.filter((item) => item.category === category)
      if (categoryItems.length > 0) {
        acc[category] = categoryItems
      }
      return acc
    },
    {} as Record<string, MenuItem[]>,
  )

  return (
    <div className="space-y-6">

      {/* Filters Section */}
      <div className="flex gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* No Results Message */}
      {filteredItems.length === 0 && menuItems.length > 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or filters to find what you&apos;re looking for.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSortBy("name");
              }}
            >
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Cart Items Preview */}
      {cart.length > 0 && (
        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-emerald-800">Cart Items</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Clear Cart
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {cart.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-gray-600">
                      {item.category} • ₹{item.price}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFromCart(item._id)}
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                    <Button size="sm" variant="outline" onClick={() => addToCart(item)} className="h-6 w-6 p-0">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Menu Items */}
      {Object.keys(groupedItems).length > 0 ? (
        Object.entries(groupedItems).map(([category, items]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800">{category}s</h2>
              <Badge variant="secondary">{items.length} items</Badge>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {items.map((item) => {
              const quantity = getItemQuantity(item._id)
              const isDisabled = !item.isActive
              
              return (
                <Card 
                  key={item._id} 
                  className={`flex-shrink-0 w-48 overflow-hidden transition-all duration-200 group ${
                    isDisabled 
                      ? 'opacity-50 grayscale cursor-not-allowed' 
                      : 'hover:shadow-lg'
                  }`}
                >
                  <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center relative">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      width={150}
                      height={150}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `/placeholder.svg?height=150&width=150`
                      }}
                    />
                    {quantity > 0 && !isDisabled && (
                      <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {quantity}
                      </div>
                    )}
                    {isDisabled && (
                      <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-2 py-1 text-xs font-bold">
                        Unavailable
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm leading-tight ${isDisabled ? 'text-gray-500' : ''}`}>
                      {item.name}
                    </CardTitle>
                    <CardDescription className={`font-semibold ${isDisabled ? 'text-gray-400' : 'text-emerald-600'}`}>
                      ₹{item.price}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isDisabled ? (
                      <Button
                        size="sm"
                        className="w-full bg-gray-400 text-gray-600 cursor-not-allowed"
                        disabled
                      >
                        Unavailable
                      </Button>
                    ) : quantity === 0 ? (
                      <Button
                        size="sm"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs"
                        onClick={() => addToCart(item)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    ) : (
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item._id)}
                          className="h-7 w-7 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-semibold px-2">{quantity}</span>
                        <Button size="sm" variant="outline" onClick={() => addToCart(item)} className="h-7 w-7 p-0">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
        ))
      ) : (
        // Fallback: Show all items without category grouping if no categories match
        filteredItems.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-800">All Items</h2>
              <Badge variant="secondary">{filteredItems.length} items</Badge>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {filteredItems.map((item) => {
                const quantity = getItemQuantity(item._id)
                const isDisabled = !item.isActive
                
                return (
                  <Card 
                    key={item._id} 
                    className={`flex-shrink-0 w-48 overflow-hidden transition-all duration-200 group ${
                      isDisabled 
                        ? 'opacity-50 grayscale cursor-not-allowed' 
                        : 'hover:shadow-lg'
                    }`}
                  >
                    <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center relative">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        width={150}
                        height={150}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `/placeholder.svg?height=150&width=150`
                        }}
                      />
                      {quantity > 0 && !isDisabled && (
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                          {quantity}
                        </div>
                      )}
                      {isDisabled && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-2 py-1 text-xs font-bold">
                          Unavailable
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className={`text-sm leading-tight ${isDisabled ? 'text-gray-500' : ''}`}>
                        {item.name}
                      </CardTitle>
                      <CardDescription className={`font-semibold ${isDisabled ? 'text-gray-400' : 'text-emerald-600'}`}>
                        ₹{item.price}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {isDisabled ? (
                        <Button
                          size="sm"
                          className="w-full bg-gray-400 text-gray-600 cursor-not-allowed"
                          disabled
                        >
                          Unavailable
                        </Button>
                      ) : quantity === 0 ? (
                        <Button
                          size="sm"
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs"
                          onClick={() => addToCart(item)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      ) : (
                        <div className="flex items-center justify-between">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item._id)}
                            className="h-7 w-7 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-semibold px-2">{quantity}</span>
                          <Button size="sm" variant="outline" onClick={() => addToCart(item)} className="h-7 w-7 p-0">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      )}

      {/* Checkout Modal */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Complete Order
            </DialogTitle>
            <DialogDescription>Enter customer details to process the order</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Order Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total ({getTotalItems()} items)</span>
                  <span className="text-emerald-600">₹{getTotalPrice()}</span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <Label htmlFor="customerPhone">Customer Phone</Label>
                <Input
                  id="customerPhone"
                  placeholder="Enter phone number"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  ref={phoneInputRef}
                  onFocus={() => {
                    if (filteredCustomers.length > 0) setShowCustomerDropdown(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowCustomerDropdown(false), 150);
                  }}
                />
                {/* Dropdown for existing customers */}
                {showCustomerDropdown && (
                  <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-y-auto max-h-60 animate-fade-in">
                    {filteredCustomers.length > 0 ? (
                      <>
                        <div className="px-4 py-2 text-xs text-gray-500 border-b bg-gray-50 rounded-t-xl font-semibold tracking-wide">
                          Existing Customers
                        </div>
                        {filteredCustomers.map((c, idx) => (
                          <div
                            key={c.phone}
                            className="flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors duration-100 hover:bg-emerald-100/80 focus:bg-emerald-200 border-b last:border-b-0 group"
                            style={{ borderTopLeftRadius: idx === 0 ? '0.75rem' : undefined, borderTopRightRadius: idx === 0 ? '0.75rem' : undefined, borderBottomLeftRadius: idx === filteredCustomers.length - 1 ? '0.75rem' : undefined, borderBottomRightRadius: idx === filteredCustomers.length - 1 ? '0.75rem' : undefined }}
                            onMouseDown={() => {
                              setCustomerName(c.name);
                              setCustomerPhone(c.phone);
                              setShowCustomerDropdown(false);
                              phoneInputRef.current?.blur();
                            }}
                          >
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200 group-hover:text-emerald-900 transition-colors">
                              <User2 className="w-4 h-4" />
                            </span>
                            <span className="font-medium text-gray-900">{c.name}</span>
                            <span className="ml-auto text-gray-500 text-xs font-mono tracking-wide">{c.phone}</span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-3 text-center text-sm text-gray-400">No matches found</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCheckout(false)}
                className="flex-1"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitOrder}
                disabled={isProcessing || !customerName || !customerPhone}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {isProcessing ? (
                  "Processing..."
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Complete Order
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Welcome Modal */}
      <Dialog open={showWelcomeModal} onOpenChange={setShowWelcomeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send WhatsApp Welcome</DialogTitle>
            <DialogDescription>
              Send a welcome message to the new customer via WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-center">
            <div className="text-lg font-semibold">{newCustomerName}</div>
            <div className="text-gray-500">{newCustomerPhone}</div>
            <a
              href={`https://wa.me/91${newCustomerPhone}?text=${encodeURIComponent(
                `Hi ${newCustomerName}, welcome to Janis FruitFul! Thank you for your first purchase. We hope you enjoy your experience!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mt-2"
              onClick={() => setShowWelcomeModal(false)}
            >
              Send WhatsApp Message
            </a>
            <button
              className="block w-full mt-2 text-gray-500 hover:text-gray-700 text-sm"
              onClick={() => setShowWelcomeModal(false)}
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fixed Checkout Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-[9999]">
          <Button 
            onClick={handleCheckout} 
            className="bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Checkout ({getTotalItems()})
          </Button>
        </div>
      )}
    </div>
  )
}
