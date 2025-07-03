"use client"

export const dynamic = "force-dynamic";

import type React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getApiUrl } from "@/lib/config";
import { Calendar, ChevronRight, Gift, IndianRupee, MessageCircle, Search, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

interface Customer {
  _id: string
  name: string
  phone: string
  orders: Array<{
    drinkType: string
    itemName: string
    price: number
    date: string
    isReward: boolean
  }>
  totalOrders: number
  rewardsEarned: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (!Array.isArray(customers)) {
      setFilteredCustomers([]);
      return;
    }
    
    const filtered = customers.filter(
      (customer) => {
        const name = customer.name || "";
        const phone = customer.phone || "";
        const searchLower = searchTerm.toLowerCase();
        
        return name.toLowerCase().includes(searchLower) || phone.includes(searchTerm);
      }
    )
    setFilteredCustomers(filtered)
  }, [customers, searchTerm])

  const fetchCustomers = async () => {
    try {
      const response = await fetch(getApiUrl('api/customers'))
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      // Ensure data is an array
      setCustomers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch customers:", error)
      setCustomers([]) // Set empty array on error
    }
  }

  const sendWhatsAppReminder = (customer: Customer, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Calculate drinks needed for reward
    const paidDrinks = customer.orders.filter(order => !order.isReward).length;
    const effectivePaidDrinks = paidDrinks - (customer.rewardsEarned * 5);
    const progressTowardReward = effectivePaidDrinks % 5;
    const drinksUntilReward = progressTowardReward === 0 && effectivePaidDrinks > 0 ? 0 : 5 - progressTowardReward;
    
    const message = `Hi ${customer.name}, You're just ${
      drinksUntilReward
    } drink${
      drinksUntilReward > 1 ? "s" : ""
    } away from a free reward! Visit us soon.Keep the streak going and claim your free drink! 💥  
We can't wait to see you again 😊`
    const whatsappUrl = `https://api.whatsapp.com/send?phone=91${customer.phone}&text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const getTotalSpent = (customer: Customer) => {
    return customer.orders.reduce((total, order) => total + (order.isReward ? 0 : order.price), 0)
  }

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowDetails(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage customer information and track rewards</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCustomers.map((customer) => {
          return (
            <Card
              key={customer._id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] group"
              onClick={() => handleCustomerClick(customer)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                      {customer.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <span>{customer.phone}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => sendWhatsAppReminder(customer, e)}
                      className="text-green-600 border-green-600 hover:bg-green-50 p-2"
                    >
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">{customer.totalOrders}</div>
                    <div className="text-xs text-gray-600">Total Orders</div>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">{customer.rewardsEarned}</div>
                    <div className="text-xs text-gray-600">Rewards Earned</div>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">₹{getTotalSpent(customer)}</div>
                  <div className="text-xs text-gray-600">Total Spent</div>
                </div>

              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg">No customers found matching your search.</p>
        </div>
      )}

      {/* Customer Details Modal */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 font-semibold">{selectedCustomer?.name.charAt(0).toUpperCase()}</span>
              </div>
              {selectedCustomer?.name}
            </DialogTitle>
            <DialogDescription>Customer details and order history</DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-emerald-600">{selectedCustomer.totalOrders}</div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Gift className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{selectedCustomer.rewardsEarned}</div>
                  <div className="text-sm text-gray-600">Rewards Earned</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <IndianRupee className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{getTotalSpent(selectedCustomer)}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Order History ({selectedCustomer.orders.length} orders)
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedCustomer.orders.map((order, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        order.isReward ? "bg-purple-50 border-purple-500" : "bg-emerald-50 border-emerald-500"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{order.itemName}</h4>
                            {order.isReward && (
                              <Badge className="bg-purple-600 text-xs">
                                <Gift className="h-3 w-3 mr-1" />
                                FREE REWARD
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{order.drinkType}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-lg font-semibold ${
                              order.isReward ? "text-purple-600" : "text-emerald-600"
                            }`}
                          >
                            {order.isReward ? "FREE" : `₹${order.price}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
