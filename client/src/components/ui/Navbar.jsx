"use client"

import { useState, useContext, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RiHome4Line, RiDashboardLine, RiPlayCircleLine, RiSearchLine, RiNotification3Line, RiUser3Line, RiSettings3Line, RiLogoutBoxRLine } from "react-icons/ri"
import { toast } from "react-toastify"

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const { user, token, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const getAvatarInitials = (username) => {
    if (!username) return "U";
    
    const words = username.trim().split(/\s+/);
    
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
  };

  const handleLogout = () => {
    try {
      logout()
      toast.success("Logged out successfully!")
      navigate("/login", { replace: true })
    } catch (err) {
      toast.error("Failed to logout. Please try again.")
      console.error("Logout error:", err)
    }
  }

  // Debugging: Log user and token data
  useEffect(() => {
    console.log("User data from AuthContext:", user);
    console.log("Token from AuthContext:", token);
  }, [user, token]);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-gray-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500 text-white">
              <RiPlayCircleLine size={20} />
            </div>
            <span className="text-xl font-bold">StreamHub</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden items-center gap-6 md:flex">
            <Link to="/" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-purple-500 transition-colors">
              <RiHome4Line size={16} />
              Home
            </Link>
            {token && (
              <>
                <Link to="/dashboard" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-purple-500 transition-colors">
                  <RiDashboardLine size={16} />
                  Dashboard
                </Link>
                <Link to="/stream" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-purple-500 transition-colors">
                  <RiPlayCircleLine size={16} />
                  Go Live
                </Link>
              </>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                type="text"
                placeholder="Search streams, creators..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {token ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-gray-600 hover:bg-gray-100">
                  <RiNotification3Line size={20} />
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-medium">
                    3
                  </span>
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 text-white">
                        {getAvatarInitials(user?.username)}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200">
                    <DropdownMenuLabel className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-gray-900">{user?.username || "User"}</span>
                      <span className="text-xs text-gray-500">{user?.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50">
                        <RiUser3Line size={16} />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50">
                        <RiSettings3Line size={16} />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-200" />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      <RiLogoutBoxRLine size={16} />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-100">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-purple-500 hover:bg-purple-600 text-white">
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar