"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Star, 
  ShoppingCart, 
  Eye, 
  Truck, 
  Leaf, 
  Package, 
  Zap,
  ArrowRight,
  Coffee,
  Users,
  Gift,
  Heart,
  Info
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Animation hook for scroll-triggered animations when component comes into view
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

// Types
interface Juice {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
}

interface Testimonial {
  name: string;
  text: string;
  rating: number;
  avatar: string;
}

interface Category {
  name: string;
  icon: string;
  tagline: string;
  color: string;
}

// Mock data
const testimonials: Testimonial[] = [
  {
    name: "Aarav S.",
    text: "The mango juice is insanely good! Fresh and delicious every time.",
    rating: 5,
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Priya K.",
    text: "Love the Buy 5 Get 1 Free offer! Perfect for sharing with friends.",
    rating: 5,
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Rahul M.",
    text: "Best juice shop in town. My kids love the watermelon juice!",
    rating: 4,
    avatar: "/placeholder-user.jpg",
  },
  {
    name: "Zara K.",
    text: "The green detox juice is amazing! I feel so energized after drinking it.",
    rating: 5,
    avatar: "/placeholder-user.jpg",
  },
];

const categories: Category[] = [
  {
    name: "Citrus",
    icon: "🍊",
    tagline: "Zesty and refreshing!",
    color: "from-orange-400 to-yellow-400",
  },
  {
    name: "Green",
    icon: "🥬",
    tagline: "Healthy and detoxifying!",
    color: "from-green-400 to-emerald-400",
  },
  {
    name: "Tropical",
    icon: "🥭",
    tagline: "Exotic and sweet!",
    color: "from-pink-400 to-orange-400",
  },
  {
    name: "Detox",
    icon: "🥒",
    tagline: "Clean and pure!",
    color: "from-green-300 to-blue-400",
  },
  {
    name: "Smoothies",
    icon: "🍓",
    tagline: "Creamy and filling!",
    color: "from-purple-400 to-pink-400",
  },
  {
    name: "Berries",
    icon: "🫐",
    tagline: "Antioxidant rich!",
    color: "from-red-400 to-purple-400",
  },
];

const galleryImages = [
  "/Menu_2.PNG",
  "/Menu_3.PNG", 
  "/Menu_4.PNG",
  "/placeholder.jpg",
  "/placeholder.jpg",
  "/placeholder.jpg",
];

export default function CustomerPage() {
  const [topSellers, setTopSellers] = useState<Juice[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Scroll-triggered animations for each section
  const [heroRef, heroVisible] = useScrollAnimation();
  const [topSellersRef, topSellersVisible] = useScrollAnimation();
  const [howItWorksRef, howItWorksVisible] = useScrollAnimation();
  const [testimonialsRef, testimonialsVisible] = useScrollAnimation();
  const [categoriesRef, categoriesVisible] = useScrollAnimation();
  const [whyChooseUsRef, whyChooseUsVisible] = useScrollAnimation();

  useEffect(() => {
    fetchTopSellers();
  }, []);

  const fetchTopSellers = async () => {
    setLoading(true);
    try {
      // Use the provided real data instead of API call
      const realData = [
        {
          id: "6866b8f7855b766493bc0034",
          name: "Oreo milk shake",
          price: "₹88",
          image: "https://res.cloudinary.com/drxzbuwnu/image/upload/v1750469183/janifruitful/menu-items/rmopfwrx37cviy9mv8zz.png",
          category: "Milkshake",
        },
        {
          id: "6866b8f7855b766493bc002e",
          name: "Mango special lassi",
          price: "₹60",
          image: "https://res.cloudinary.com/drxzbuwnu/image/upload/v1751555668/janifruitful/menu-items/f2kdud6pbme0j12gpwrw.png",
          category: "Lassi",
        },
        {
          id: "6866b8f7855b766493bc0007",
          name: "Natural orange",
          price: "₹70",
          image: "https://res.cloudinary.com/drxzbuwnu/image/upload/v1750470875/janifruitful/menu-items/zpmooebcnacduoylh8eh.png",
          category: "Mojito",
        },
        {
          id: "6866b8f7855b766493bc0021",
          name: "Dry fruit milk shake",
          price: "₹88",
          image: "https://res.cloudinary.com/drxzbuwnu/image/upload/v1750469122/janifruitful/menu-items/w8g9houqqegd5h9qcd0a.png",
          category: "Milkshake",
        },
        {
          id: "6866b8f7855b766493bc0018",
          name: "Papaya",
          price: "₹30",
          image: "https://res.cloudinary.com/drxzbuwnu/image/upload/v1751554934/janifruitful/menu-items/oo41irdtskzx5rcbb9gn.png",
          category: "Fruit Plate",
        },
        {
          id: "6866b8f7855b766493bc0024",
          name: "Blue curaco",
          price: "₹70",
          image: "https://res.cloudinary.com/drxzbuwnu/image/upload/v1750470514/janifruitful/menu-items/r8rcqfjudkelsb3s2smx.png",
          category: "Mojito",
        },
      ];
      
      setTopSellers(realData);
    } catch {
      setTopSellers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className={`relative bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 py-24 overflow-hidden transition-all duration-1000 ${
          heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 via-teal-100/20 to-green-100/30"></div>
        
        {/* Floating Emojis */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🥭</div>
          <div className="absolute top-20 right-10 text-3xl animate-bounce" style={{ animationDelay: '1s' }}>🍊</div>
          <div className="hidden md:block absolute bottom-32 left-20 text-4xl animate-bounce" style={{ animationDelay: '2s' }}>🍍</div>
          <div className="hidden md:block absolute bottom-20 right-10 text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>🥝</div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center">
            {/* Special Offer Badge */}
            <div className={`inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full text-lg font-bold mb-8 shadow-lg transition-all duration-700 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>
              <Gift className="w-5 h-5" />
              Buy 5 Get 1 FREE!
            </div>

            {/* Main Heading */}
            <h1 className={`text-5xl md:text-7xl font-bold text-green-900 mb-6 leading-tight transition-all duration-700 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>
              Fresh & Healthy
              <span className="block text-emerald-600">Juice Delights</span>
            </h1>

            {/* Subtitle */}
            <p className={`text-xl md:text-2xl text-green-700 mb-8 max-w-3xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>
              Discover our amazing 5+1 offer! Buy any 5 drinks from the same category and get the 6th one absolutely FREE!
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-12 transition-all duration-700 delay-300 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>
              <Button asChild variant="outline" size="lg" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white text-xl px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Link href="/customer/rewards">
                  Check Your Rewards
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className={`grid grid-cols-3 gap-8 max-w-2xl mx-auto transition-all duration-700 delay-400 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">500+</div>
                <div className="text-green-700">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">50+</div>
                <div className="text-green-700">Fresh Drinks</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">24/7</div>
                <div className="text-green-700">Fast Delivery</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="currentColor" className="text-green-200"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="currentColor" className="text-green-300"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor" className="text-green-400"></path>
          </svg>
        </div>
      </section>

      {/* Top Sellers Section */}
      <section 
        ref={topSellersRef}
        className={`py-20 bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-1000 ${
          topSellersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4 transition-all duration-700 ${
              topSellersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              Most Popular
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold text-green-900 mb-4 transition-all duration-700 ${
              topSellersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>Top Sellers</h2>
            <p className={`text-xl text-green-700 max-w-2xl mx-auto transition-all duration-700 ${
              topSellersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>Our most loved and popular drinks that customers can't get enough of</p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className={`animate-pulse bg-white/80 backdrop-blur-sm border-green-200 transition-all duration-700 ${
                  topSellersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                  <div className="h-40 md:h-72 bg-green-200" />
                  <CardContent className="p-2 md:p-6">
                    <div className="h-4 bg-green-200 rounded mb-2" />
                    <div className="h-6 bg-green-200 rounded mb-4" />
                    <div className="h-4 bg-green-200 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))
            ) : (
              topSellers.map((juice, index) => (
                <Card key={juice.id} className={`flex flex-col items-center bg-white/80 rounded-2xl shadow-md border border-green-100 p-4 hover:shadow-lg transition transition-all duration-700 ${
                  topSellersVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}>
                  <div className="w-[120px] h-[120px] flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl mb-3 overflow-hidden">
                    {juice.image ? (
                      <Image
                        src={juice.image}
                        alt={juice.name}
                        width={120}
                        height={120}
                        className="object-contain w-full h-full"
                        priority
                      />
                    ) : null}
                    <Coffee className={`w-16 h-16 text-green-400 ${juice.image ? 'hidden' : ''}`} />
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Popular
                    </div>
                  </div>
                  <CardContent className="p-2 md:p-6">
                    <div className="mb-4">
                      <CardTitle className="text-lg font-semibold text-gray-900 text-center">{juice.name}</CardTitle>
                      <div className="mt-1 text-green-700 font-bold text-base">{juice.price}</div>
                      <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 mt-2">{juice.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section 
        ref={howItWorksRef}
        className={`py-20 bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-1000 ${
          howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4 transition-all duration-700 ${
              howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>
              <Gift className="w-4 h-4" />
              Simple Process
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold text-green-900 mb-4 transition-all duration-700 ${
              howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>How It Works</h2>
            <p className={`text-xl text-green-700 max-w-2xl mx-auto transition-all duration-700 ${
              howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>Get your free drink in 3 simple steps - it's that easy!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className={`text-center p-8 bg-white/90 backdrop-blur-sm border-green-200 hover:shadow-xl transition-all duration-300 hover:scale-105 transition-all duration-700 ${
              howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-3">Pick a Category</h3>
              <p className="text-green-700 text-base">Choose from Citrus, Green, Tropical, or any category you love</p>
            </Card>
            
            <Card className={`text-center p-8 bg-white/90 backdrop-blur-sm border-green-200 hover:shadow-xl transition-all duration-300 hover:scale-105 transition-all duration-700 ${
              howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-3">Add 5 Drinks</h3>
              <p className="text-green-700 text-base">Select any 5 drinks from the same category to your cart</p>
            </Card>
            
            <Card className={`text-center p-8 bg-white/90 backdrop-blur-sm border-green-200 hover:shadow-xl transition-all duration-300 hover:scale-105 transition-all duration-700 ${
              howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-green-900 mb-3">Get 1 Free!</h3>
              <p className="text-green-700 text-base">The 6th drink is automatically added to your cart for FREE!</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        ref={testimonialsRef}
        className={`py-20 bg-white transition-all duration-1000 ${
          testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4 transition-all duration-700 ${
              testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>
              <Heart className="w-4 h-4 fill-red-400 text-red-400" />
              Customer Love
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold text-green-900 mb-4 transition-all duration-700 ${
              testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>What Our Customers Say</h2>
            <p className={`text-xl text-green-700 max-w-2xl mx-auto transition-all duration-700 ${
              testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>Real reviews from our happy and satisfied customers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.slice(0, 4).map((testimonial, idx) => (
              <Card key={idx} className={`p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-xl transition-all duration-300 hover:scale-105 transition-all duration-700 ${
                testimonialsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-4 border-green-200"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="font-bold text-lg text-green-900">{testimonial.name}</div>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-green-700 text-base italic leading-relaxed">"{testimonial.text}"</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      {/* <section 
        ref={categoriesRef}
        className={`py-20 bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-1000 ${
          categoriesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4 transition-all duration-700 ${
              categoriesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>
              <Coffee className="w-4 h-4" />
              Browse Categories
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold text-green-900 mb-4 transition-all duration-700 ${
              categoriesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>Shop by Category</h2>
            <p className={`text-xl text-green-700 max-w-2xl mx-auto transition-all duration-700 ${
              categoriesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>Find your favorite type of drink from our diverse collection</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Card key={category.name} className={`cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white/90 backdrop-blur-sm border-green-200 group transition-all duration-700 ${
                categoriesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}>
                <CardHeader className="text-center pb-6 pt-8">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                  <CardTitle className="text-xl font-bold text-green-900">{category.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0 pb-8">
                  <p className="text-green-700 text-base font-medium">{category.tagline}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Why Choose Us Section */}
      <section 
        ref={whyChooseUsRef}
        className={`py-20 bg-white transition-all duration-1000 ${
          whyChooseUsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className={`inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4 transition-all duration-700 ${
              whyChooseUsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              Premium Quality
            </div>
            <h2 className={`text-4xl md:text-5xl font-bold text-green-900 mb-4 transition-all duration-700 ${
              whyChooseUsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>Why Choose Us</h2>
            <p className={`text-xl text-green-700 max-w-2xl mx-auto transition-all duration-700 ${
              whyChooseUsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}>Quality and service you can trust - we're committed to excellence</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className={`text-center group transition-all duration-700 ${
              whyChooseUsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-green-900 mb-3">Fast Delivery</h3>
              <p className="text-green-700 text-sm">Same day delivery to your doorstep</p>
            </div>
            
            <div className={`text-center group transition-all duration-700 ${
              whyChooseUsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Leaf className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-green-900 mb-3">100% Natural</h3>
              <p className="text-green-700 text-sm">No artificial ingredients or preservatives</p>
            </div>
            
            <div className={`text-center group transition-all duration-700 ${
              whyChooseUsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Package className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-green-900 mb-3">Eco-Friendly</h3>
              <p className="text-green-700 text-sm">Recyclable and sustainable packaging</p>
            </div>
            
            <div className={`text-center group transition-all duration-700 ${
              whyChooseUsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-green-900 mb-3">Cold-Pressed</h3>
              <p className="text-green-700 text-sm">Maximum nutrition and freshness</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 