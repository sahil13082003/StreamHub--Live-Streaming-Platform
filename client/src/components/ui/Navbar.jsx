"use client"
import { useState, useContext, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  RiHome4Line, 
  RiDashboardLine, 
  RiPlayCircleLine, 
  RiSearchLine, 
  RiNotification3Line, 
  RiUser3Line, 
  RiSettings3Line, 
  RiLogoutBoxRLine,
  RiHeartFill,
  RiUserFollowFill,
  RiLiveFill,
  RiCloseLine
} from "react-icons/ri"
import { toast } from "react-toastify"
import axios from "@/services/api"
import { formatDistanceToNow } from "date-fns"

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const { user, token, logout } = useContext(AuthContext)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [ws, setWs] = useState(null)
  const navigate = useNavigate()

  // Fetch initial notifications and setup WebSocket
  useEffect(() => {
    if (!token) return

    const fetchNotifications = async () => {
      try {
        const response = await axios.get("/notifications")
        setNotifications(response.data)
        setUnreadCount(response.data.filter(n => !n.read).length)
      } catch (error) {
        console.error("Failed to fetch notifications:", error)
      }
    }

    fetchNotifications()

    // Setup WebSocket connection
    const socket = new WebSocket(`${process.env.NODE_ENV === 'development' ? 'ws' : 'wss'}://${window.location.host}/ws/notifications`)

    socket.onopen = () => {
      socket.send(JSON.stringify({ token }))
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'NEW_NOTIFICATION') {
        setNotifications(prev => [data.notification, ...prev])
        setUnreadCount(prev => prev + 1)
        showNotificationToast(data.notification)
      }
    }

    socket.onclose = () => {
      console.log("WebSocket disconnected")
    }

    setWs(socket)

    return () => {
      if (socket) socket.close()
    }
  }, [token])

  const showNotificationToast = (notification) => {
    const message = getNotificationMessage(notification)
    const icon = getNotificationIcon(notification.type, "text-lg")
    
    toast.info(
      <div className="flex items-center gap-2">
        {icon}
        <span>{message}</span>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    )
  }

  const getAvatarInitials = (username) => {
    if (!username) return "U"
    const words = username.trim().split(/\s+/)
    if (words.length === 1) return words[0].charAt(0).toUpperCase()
    return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase()
  }

  const handleLogout = () => {
    try {
      logout()
      if (ws) ws.close()
      toast.success("Logged out successfully!")
      navigate("/login", { replace: true })
    } catch (err) {
      toast.error("Failed to logout. Please try again.")
      console.error("Logout error:", err)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/notifications/${notificationId}/read`)
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => prev - 1)
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.patch("/notifications/mark-all-read")
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const getNotificationIcon = (type, className = "") => {
    const baseClass = `${className} mr-2`
    switch(type) {
      case 'follow':
        return <RiUserFollowFill className={`${baseClass} text-blue-500`} />
      case 'like':
        return <RiHeartFill className={`${baseClass} text-red-500`} />
      case 'live':
        return <RiLiveFill className={`${baseClass} text-purple-500`} />
      default:
        return <RiNotification3Line className={baseClass} />
    }
  }

  const getNotificationMessage = (notification) => {
    switch(notification.type) {
      case 'follow':
        return `${notification.sender.username} started following you`
      case 'like':
        return `${notification.sender.username} liked your video "${notification.video?.title}"`
      case 'live':
        return `${notification.sender.username} went live: "${notification.stream?.title}"`
      default:
        return notification.message
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id)
    }
    
    switch(notification.type) {
      case 'follow':
        navigate(`/streamer/${notification.sender._id}`)
        break
      case 'like':
        navigate(`/video/${notification.video?._id}`)
        break
      case 'live':
        navigate(`/stream/${notification.stream?._id}`)
        break
      default:
        break
    }
  }

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation()
    try {
      await axios.delete(`/notifications/${notificationId}`)
      setNotifications(notifications.filter(n => n._id !== notificationId))
      if (notifications.find(n => n._id === notificationId)?.read === false) {
        setUnreadCount(prev => prev - 1)
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

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
                <Link to="/video" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-purple-500 transition-colors">
                  <RiDashboardLine size={16} />
                  Videos
                </Link>
                <Link to="/stream/setup" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-purple-500 transition-colors">
                  <RiPlayCircleLine size={16} />
                  Go Live
                </Link>
                <Link to="/streamers" className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-purple-500 transition-colors">
                  <RiUser3Line size={16} />
                  Streamers
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-gray-600 hover:bg-gray-100">
                      <RiNotification3Line size={20} />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-96 max-h-[80vh] overflow-y-auto">
                    <DropdownMenuLabel className="flex justify-between items-center sticky top-0 bg-white z-10">
                      <span className="font-semibold">Notifications</span>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.preventDefault()
                            markAllAsRead()
                          }}
                        >
                          Mark all read
                        </Button>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <DropdownMenuItem 
                          key={notification._id}
                          className={`flex gap-3 items-start p-3 ${!notification.read ? 'bg-gray-50' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {getNotificationMessage(notification)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <span className="h-2 w-2 rounded-full bg-purple-500" />
                            )}
                            <button 
                              className="text-gray-400 hover:text-gray-600"
                              onClick={(e) => deleteNotification(notification._id, e)}
                            >
                              <RiCloseLine size={16} />
                            </button>
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <DropdownMenuItem className="text-sm text-gray-500 justify-center py-4">
                        No notifications yet
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

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