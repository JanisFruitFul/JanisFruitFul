import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Coffee } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900">
            Welcome to JaniFruitful
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your one-stop destination for delicious drinks and amazing rewards
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          {/* Customer Card */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 shadow-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Coffee className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">Customer Portal</CardTitle>
              <CardDescription className="text-lg">
                View our menu, check your rewards status, and see your order history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/customer">
                <Button className="w-full h-12 text-lg font-semibold">
                  View Menu & Rewards
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Rewards Program</h3>
            <p className="text-sm text-gray-600">Every 5 drinks = 1 FREE drink</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Premium Quality</h3>
            <p className="text-sm text-gray-600">Fresh ingredients, great taste</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Easy Tracking</h3>
            <p className="text-sm text-gray-600">Check your rewards anytime</p>
          </div>
        </div>
      </div>
    </div>
  )
}
