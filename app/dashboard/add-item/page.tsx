"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { getApiUrl } from "@/lib/config";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const categories = ["Mojito", "Ice Cream", "Milkshake", "Waffle"];

export default function AddItemPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      // Validate form data
      const name = formData.get("name") as string;
      const price = formData.get("price") as string;
      const description = formData.get("description") as string;

      if (!name || !selectedCategory || !price || !imageFile) {
        toast.error("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Create FormData for the entire request
      const submitFormData = new FormData();
      submitFormData.append("name", name.trim());
      submitFormData.append("category", selectedCategory);
      submitFormData.append("price", price);
      submitFormData.append("description", description.trim() || "");
      submitFormData.append("image", imageFile);

      console.log("Submitting form data...");

      // Send everything to the API route
      const response = await fetch(getApiUrl('api/menu-items'), {
        method: "POST",
        body: submitFormData, // Send as FormData instead of JSON
      });

      const responseData = await response.json();
      console.log("API response:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create menu item");
      }

      toast.success("Menu item added successfully!");
      
      // Reset form
      e.currentTarget.reset();
      setImageFile(null);
      setSelectedCategory("");
      
      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add menu item");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      
      setImageFile(file);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Add New Menu Item</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="name">Item Name *</Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Enter item name"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select 
            value={selectedCategory} 
            onValueChange={setSelectedCategory}
            disabled={isLoading}
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="Enter price"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            placeholder="Enter item description (optional)"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Item Image *</Label>
          <Input
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            disabled={isLoading}
          />
          <p className="text-sm text-gray-500">
            Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
          </p>
          {imageFile && (
            <p className="text-sm text-green-600">
              Selected: {imageFile.name}
            </p>
          )}
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Adding Item..." : "Add Item"}
        </Button>
      </form>
    </div>
  );
} 