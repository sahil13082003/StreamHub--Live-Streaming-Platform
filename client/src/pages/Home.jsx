"use client"

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RiPlayCircleLine, RiEyeLine, RiPulseLine, RiShieldCheckLine, RiGlobalLine } from "react-icons/ri"
import Navbar from "../components/ui/Navbar"

const Home = () => {
  const featuredStreams = [
    {
      id: 1,
      title: "Building a React App Live",
      streamer: "CodeMaster",
      avatar: "https://via.placeholder.com/40",
      viewers: 1234,
      category: "Programming",
      thumbnail: "https://via.placeholder.com/300x200",
      isLive: true,
    },
    {
      id: 2,
      title: "Gaming Tournament Finals",
      streamer: "ProGamer",
      avatar: "https://via.placeholder.com/40",
      viewers: 5678,
      category: "Gaming",
      thumbnail: "https://via.placeholder.com/300x200",
      isLive: true,
    },
    {
      id: 3,
      title: "Music Production Session",
      streamer: "BeatMaker",
      avatar: "https://via.placeholder.com/40",
      viewers: 892,
      category: "Music",
      thumbnail: "https://via.placeholder.com/300x200",
      isLive: true,
    },
    {
      id: 4,
      title: "Digital Art Creation",
      streamer: "ArtistPro",
      avatar: "https://via.placeholder.com/40",
      viewers: 456,
      category: "Art",
      thumbnail: "https://via.placeholder.com/300x200",
      isLive: true,
    },
  ]

  const categories = [
    { name: "Gaming", count: 1234, icon: "🎮" },
    { name: "Programming", count: 567, icon: "💻" },
    { name: "Music", count: 890, icon: "🎵" },
    { name: "Art", count: 234, icon: "🎨" },
    { name: "Education", count: 456, icon: "📚" },
    { name: "Fitness", count: 123, icon: "💪" },
  ]

  return (
    
    <div className="min-h-screen p-10 bg-gradient-to-br from-purple-100 via-white to-gray-50">
      {/* Hero Section */}
      
      <section className=" ">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-purple-200 text-purple-800">
                <RiPlayCircleLine className="mr-1" /> Now Live
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Stream Your <span className="text-purple-500">Passion</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                Connect with your audience through high-quality live streaming. Share your skills, build your community, and grow your brand.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-purple-500 hover:bg-purple-600 text-white">
                  <Link to="/register">Start Streaming</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-100">
                  <Link to="/login">Watch Now</Link>
                </Button>
              </div>
              <div className="flex gap-6 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Active Streamers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">1M+</div>
                  <div className="text-sm text-gray-600">Monthly Viewers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Live Content</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-200 shadow-lg">
                <img src="https://via.placeholder.com/600x400" alt="Live streaming preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="icon" className="bg-purple-500 hover:bg-purple-600 text-white rounded-full w-16 h-16 transform hover:scale-110 transition-transform">
                    <RiPlayCircleLine size={24} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Streams */}
      <section className="py-16 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Featured Streams</h2>
              <p className="text-gray-600">Discover popular live streams happening right now</p>
            </div>
            <Button asChild variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-100">
              <Link to="/browse">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStreams.map((stream) => (
              <Card key={stream.id} className="border-gray-200 hover:shadow-lg transform hover:-translate-y-1 transition-all">
                <CardContent className="p-0">
                  <div className="relative">
                    <img src={stream.thumbnail || "/placeholder.svg"} alt={stream.title} className="w-full aspect-video object-cover rounded-t-lg" />
                    <div className="absolute top-3 left-3 right-3 flex justify-between">
                      <Badge className="bg-red-500 text-white">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse mr-1"></div> LIVE
                      </Badge>
                      <Badge className="bg-black/50 text-white">
                        <RiEyeLine className="mr-1" /> {stream.viewers.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{stream.title}</h3>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <img src={stream.avatar || "/placeholder.svg"} alt={stream.streamer} className="w-6 h-6 rounded-full" />
                        <span className="text-sm text-gray-600">{stream.streamer}</span>
                      </div>
                      <Badge className="bg-gray-100 text-gray-600">{stream.category}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Browse Categories</h2>
            <p className="text-gray-600">Explore different categories and find content that matches your interests</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Card key={category.name} className="border-gray-200 hover:shadow-lg transform hover:-translate-y-1 transition-all">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.count} streams</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose StreamHub?</h2>
            <p className="text-gray-600">Professional streaming platform with enterprise-grade features</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <RiPulseLine size={40} className="text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics & Insights</h3>
                <p className="text-gray-600">Track your performance with detailed analytics and audience insights</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <RiShieldCheckLine size={40} className="text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Reliable</h3>
                <p className="text-gray-600">Enterprise-grade security with 99.9% uptime guarantee</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="p-6">
                <RiGlobalLine size={40} className="text-purple-500 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Reach</h3>
                <p className="text-gray-600">Stream to audiences worldwide with our global CDN network</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Ready to Start Your Streaming Journey?</h2>
            <p className="text-lg text-gray-600">Join thousands of creators who trust StreamHub for their live streaming needs</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-purple-500 hover:bg-purple-600 text-white">
                <Link to="/register">Create Account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-100">
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500 text-white">
                  <RiPlayCircleLine size={20} />
                </div>
                <span className="text-xl font-bold text-gray-900">StreamHub</span>
              </div>
              <p className="text-gray-600">Professional live streaming platform for creators and businesses.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform</h3>
              <ul className="space-y-2">
                {["Features", "Pricing", "API", "Integrations"].map((item) => (
                  <li key={item}>
                    <Link to={`/${item.toLowerCase()}`} className="text-gray-600 hover:text-gray-900 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2">
                {["Help Center", "Contact", "Status", "Community"].map((item) => (
                  <li key={item}>
                    <Link to={`/${item.toLowerCase().replace(" ", "-")}`} className="text-gray-600 hover:text-gray-900 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-2">
                {["About", "Careers", "Privacy", "Terms"].map((item) => (
                  <li key={item}>
                    <Link to={`/${item.toLowerCase()}`} className="text-gray-600 hover:text-gray-900 transition-colors">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-600">
            © 2025 StreamHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home