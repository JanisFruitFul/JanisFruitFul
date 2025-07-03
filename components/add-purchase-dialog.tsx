"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getApiUrl } from "@/lib/config"
import { ShoppingCart } from "lucide-react"
import { useEffect, useState } from "react"

interface MenuItem {
  _id: string
  name: string
  category: string
  price: number
  image: string
}

interface AddPurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedItem: MenuItem | null
  onSuccess: () => void
}

export function AddPurchaseDialog({ open, onOpenChange, selectedItem, onSuccess }: AddPurchaseDialogProps) {
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [drinkType, setDrinkType] = useState("")
  const [selectedDrink, setSelectedDrink] = useState("")
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const drinkTypes = ["Mojito", "Ice Cream", "Milkshake", "Waffle"]

  useEffect(() => {
    if (selectedItem) {
      setDrinkType(selectedItem.category)
      setSelectedDrink(selectedItem._id)
    }
  }, [selectedItem])

  useEffect(() => {
    if (open) {
      fetchMenuItems()
    }
  }, [open])

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(getApiUrl('api/menu'))
      const data = await response.json()
      setMenuItems(data)
    } catch (error) {
      console.error("Failed to fetch menu items:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const selectedMenuItem = menuItems.find((item) => item._id === selectedDrink)
      if (!selectedMenuItem) {
        throw new Error("Selected item not found")
      }

      const response = await fetch(getApiUrl('api/customers/purchase'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          drinkType,
          itemId: selectedDrink,
          itemName: selectedMenuItem.name,
          price: selectedMenuItem.price,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Purchase added successfully!",
          description: data.isReward
            ? `${customerName} earned a FREE reward drink!`
            : `Purchase recorded for ${customerName}`,
        })

        // Reset form
        setCustomerName("")
        setCustomerPhone("")
        setDrinkType("")
        setSelectedDrink("")

        onSuccess()
      } else {
        throw new Error(data.message || "Failed to add purchase")
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to add purchase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredItems = menuItems.filter((item) => item.category === drinkType)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Add Purchase
          </DialogTitle>
          <DialogDescription>Record a new customer purchase and track rewards</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              placeholder="Enter customer name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerPhone">Customer Phone</Label>
            <Input
              id="customerPhone"
              placeholder="Enter phone number"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Select Drink Type</Label>
            <RadioGroup value={drinkType} onValueChange={setDrinkType}>
              {drinkTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={type} />
                  <Label htmlFor={type}>{type}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {drinkType && (
            <div className="space-y-2">
              <Label>Select Item</Label>
              <Select value={selectedDrink} onValueChange={setSelectedDrink}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an item" />
                </SelectTrigger>
                <SelectContent>
                  {filteredItems.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.name} - ₹{item.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !customerName || !customerPhone || !drinkType || !selectedDrink}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? "Processing..." : "BUY"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
