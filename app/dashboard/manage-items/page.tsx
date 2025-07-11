"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { getApiUrl } from "@/lib/config";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface MenuItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image: string;
  isActive: boolean;
  createdAt: string;
}

// Default categories - will be extended with dynamic categories from database
const defaultCategories = ["Mojito", "Ice Cream", "Milkshake", "Juice", "Fruit Plate", "Lassi"];

export default function ManageItemsPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [editFormData, setEditFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
  });
  const [addFormData, setAddFormData] = useState({
    name: "",
    category: "",
    customCategory: "",
    price: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  // 1. Add state for viewing item details
  const [viewItem, setViewItem] = useState<MenuItem | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  // Combine default and dynamic categories, removing duplicates
  const categories = [...new Set([...defaultCategories, ...dynamicCategories])];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  useEffect(() => {
    filterAndSortItems();
  }, [menuItems, searchTerm, selectedCategory, statusFilter, sortBy]);

  const filterAndSortItems = () => {
    let filtered = [...menuItems];

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by status
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(item => item.isActive === isActive);
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "category":
          return a.category.localeCompare(b.category);
        case "date-new":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "date-old":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
  };

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(getApiUrl('api/menu-items'));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const items = Array.isArray(data) ? data : [];
      setMenuItems(items);
      
      // Extract unique categories from menu items
      const uniqueCategories = [...new Set(items.map(item => item.category))];
      setDynamicCategories(uniqueCategories);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      toast.error("Failed to fetch menu items");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setEditFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description || "",
    });
    setImageFile(null);
    setShowEditDialog(true);
  };

  const handleDelete = (item: MenuItem) => {
    setDeletingItem(item);
    setShowDeleteDialog(true);
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      const response = await fetch(getApiUrl(`api/menu-items/${item._id}/toggle`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !item.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      toast.success(`Item ${item.isActive ? "made unavailable" : "made available"}`);
      fetchMenuItems(); // Refresh the list
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const formData = new FormData();
      formData.append("name", editFormData.name.trim());
      formData.append("category", editFormData.category);
      formData.append("price", editFormData.price);
      formData.append("description", editFormData.description.trim());
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(getApiUrl(`api/menu-items/${editingItem._id}`), {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }

      toast.success("Item updated successfully!");
      setShowEditDialog(false);
      setEditingItem(null);
      fetchMenuItems(); // Refresh the list
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;

    try {
      const response = await fetch(getApiUrl(`api/menu-items/${deletingItem._id}`), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      toast.success("Item deleted successfully!");
      setShowDeleteDialog(false);
      setDeletingItem(null);
      fetchMenuItems(); // Refresh the list
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      
      setImageFile(file);
    }
  };

  const handleAddImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      
      setAddImageFile(file);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingItem(true);

    try {
      // Validate form data
      const { name, category, customCategory, price, description } = addFormData;

      // Determine which category to use
      const finalCategory = useCustomCategory ? customCategory.trim() : category;

      console.log("Form validation:", {
        name: !!name,
        finalCategory: !!finalCategory,
        price: !!price,
        addImageFile: !!addImageFile,
        useCustomCategory,
        category,
        customCategory
      });

      if (!name || !finalCategory || !price || !addImageFile) {
        toast.error("Please fill in all required fields");
        setIsAddingItem(false);
        return;
      }

      // Create FormData for the request
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("category", finalCategory);
      formData.append("price", price);
      formData.append("description", description.trim() || "");
      formData.append("image", addImageFile);

      console.log("Submitting form data:", {
        name: name.trim(),
        category: finalCategory,
        price: price,
        description: description.trim() || "",
        imageFile: addImageFile?.name,
        useCustomCategory
      });

      const response = await fetch(getApiUrl('api/menu-items'), {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create menu item");
      }

      toast.success("Menu item added successfully!");
      
      // If it's a new category, add it to the dynamic categories
      if (useCustomCategory && finalCategory) {
        setDynamicCategories(prev => [...new Set([...prev, finalCategory])]);
      }
      
      // Reset form
      setAddFormData({
        name: "",
        category: "",
        customCategory: "",
        price: "",
        description: "",
      });
      setAddImageFile(null);
      setUseCustomCategory(false);
      setShowAddDialog(false);
      
      // Refresh the list
      fetchMenuItems();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add menu item");
    } finally {
      setIsAddingItem(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setStatusFilter("all");
    setSortBy("name");
  };

  // Add a helper function at the top-level of the component
  function truncateWords(text: string, wordLimit: number) {
    if (!text) return '';
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Loading menu items...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

            {/* Filters Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Filters & Search</CardTitle>
            <Button onClick={() => setShowAddDialog(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile: Single row with 3 filters */}
          <div className="flex flex-row gap-2 lg:hidden">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-sm"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-24 text-sm">
                <SelectValue placeholder="Cat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-20 text-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop: Full filter layout */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
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
              <SelectTrigger>
                <SelectValue placeholder="Category" />
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

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="date-new">Date (Newest)</SelectItem>
                <SelectItem value="date-old">Date (Oldest)</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredItems.length} of {menuItems.length} items
            {searchTerm && ` for "${searchTerm}"`}
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
            {statusFilter !== "all" && ` (${statusFilter})`}
          </div>
        </CardContent>
      </Card>

      {/* No Results Message */}
      {filteredItems.length === 0 && menuItems.length > 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Menu Items by Category */}
      {(() => {
        // Get categories that have items after filtering
        const categoriesWithItems = [...new Set(filteredItems.map(item => item.category))];
        
        return categoriesWithItems.map((category) => {
          const categoryItems = filteredItems.filter(item => item.category === category);
          
          return (
            <div key={category} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-semibold">{category}s</h2>
                <Badge variant="secondary">{categoryItems.length} items</Badge>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {categoryItems.map((item) => (
                  <Card
                    key={item._id}
                    className={`flex-shrink-0 w-48 sm:w-56 md:w-64 ${!item.isActive ? 'opacity-60' : ''} cursor-pointer`}
                    onClick={(e) => {
                      // Prevent opening view dialog if edit/delete button is clicked
                      if ((e.target as HTMLElement).closest('button')) return;
                      setViewItem(item);
                      setShowViewDialog(true);
                    }}
                  >
                    <div className="aspect-square bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center relative">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        width={150}
                        height={150}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder.svg?height=150&width=150";
                        }}
                      />
                      {!item.isActive && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Badge variant="destructive">Unavailable</Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs sm:text-sm leading-tight">{item.name}</CardTitle>
                      <CardDescription className="text-emerald-600 font-semibold text-xs sm:text-sm">
                        ₹{item.price}
                      </CardDescription>
                      {item.description && (
                        <p className="text-xs text-gray-600 whitespace-pre-line">
                          {truncateWords(item.description, 15)}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Switch
                            checked={item.isActive}
                            onCheckedChange={() => handleToggleAvailability(item)}
                            className="scale-75"
                          />
                          <span className="text-xs">
                            {item.isActive ? "Available" : "Unavailable"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                            className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item)}
                            className="h-6 w-6 sm:h-7 sm:w-7 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        });
      })()}

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
            <DialogDescription>
              Create a new menu item with details and image
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">Item Name *</Label>
                <Input
                  id="add-name"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  placeholder="Enter item name"
                  required
                  disabled={isAddingItem}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-category">Category *</Label>
                <div className="space-y-2">
                  <Select
                    value={addFormData.category}
                    onValueChange={(value) => setAddFormData({ ...addFormData, category: value })}
                    disabled={isAddingItem || useCustomCategory}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="use-custom-category"
                      checked={useCustomCategory}
                      onChange={(e) => setUseCustomCategory(e.target.checked)}
                      disabled={isAddingItem}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="use-custom-category" className="text-sm">
                      Add new category
                    </Label>
                  </div>
                </div>
              </div>
            </div>
            {useCustomCategory && (
              <div className="space-y-2">
                <Label htmlFor="add-custom-category">New Category Name *</Label>
                <Input
                  id="add-custom-category"
                  value={addFormData.customCategory}
                  onChange={(e) => setAddFormData({ ...addFormData, customCategory: e.target.value })}
                  placeholder="Enter new category name"
                  required={useCustomCategory}
                  disabled={isAddingItem}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-price">Price *</Label>
                <Input
                  id="add-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={addFormData.price}
                  onChange={(e) => setAddFormData({ ...addFormData, price: e.target.value })}
                  placeholder="Enter price"
                  required
                  disabled={isAddingItem}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-image">Item Image *</Label>
                <Input
                  id="add-image"
                  type="file"
                  accept="image/*"
                  onChange={handleAddImageChange}
                  required
                  disabled={isAddingItem}
                />
                <p className="text-xs text-gray-500">
                  Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                </p>
                {addImageFile && (
                  <p className="text-xs text-green-600">
                    Selected: {addImageFile.name}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-description">Description</Label>
              <textarea
                id="add-description"
                value={addFormData.description}
                onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
                placeholder="Enter item description (optional)"
                disabled={isAddingItem}
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px] resize-y"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddDialog(false)}
                disabled={isAddingItem}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAddingItem}>
                {isAddingItem ? "Adding Item..." : "Add Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>
              Update the item details and image
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateItem} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Item Name *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={editFormData.category}
                  onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image">New Image (optional)</Label>
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Enter item description"
                className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px] resize-y"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Item</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the menu item &quot;{deletingItem?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Item Details Dialog */}
      <Dialog open={showViewDialog} onOpenChange={(open) => {
        setShowViewDialog(open);
        if (!open) setViewItem(null);
      }}>
        <DialogContent className="max-w-lg">
          {viewItem && (
            <>
              <DialogHeader>
                <DialogTitle>{viewItem.name}</DialogTitle>
                <DialogDescription>
                  <span className="capitalize font-medium text-emerald-700">{viewItem.category}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 mt-2">
                <div className="w-40 h-40 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                  <Image
                    src={viewItem.image || "/placeholder.svg"}
                    alt={viewItem.name}
                    className="w-full h-full object-cover"
                    width={160}
                    height={160}
                  />
                </div>
                <div className="w-full text-center">
                  <p className="text-lg font-semibold text-emerald-600 mb-1">₹{viewItem.price}</p>
                  <p className="mb-2 text-gray-700">
                    {viewItem.isActive ? (
                      <span className="text-green-600 font-medium">Available</span>
                    ) : (
                      <span className="text-red-600 font-medium">Unavailable</span>
                    )}
                  </p>
                  {viewItem.description && (
                    <div className="bg-gray-50 rounded p-3 border text-gray-800 text-sm whitespace-pre-line">
                      {viewItem.description}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 