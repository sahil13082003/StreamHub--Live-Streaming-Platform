"use client"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  RiVideoLine,
  RiLiveLine,
  RiSearchLine,
  RiCloseLine,
  RiUploadCloudLine,
  RiPlayCircleLine,
} from "react-icons/ri"
import { useAuth } from "@/context/useAuth"
import axios from "@/services/api"
import { toast } from "react-toastify"
import { formatDistanceToNow } from "date-fns"

const DiscoverVideos = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [videos, setVideos] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    if (!user) {
      navigate("/login")
      toast.info(
        <div className="flex flex-col gap-2">
          <span>Please log in to access videos.</span>
          <Button
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 text-white"
            onClick={() => navigate("/login")}
          >
            Log In
          </Button>
        </div>,
        {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
        }
      )
    }
  }, [user, navigate])

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const [videosRes, categoriesRes] = await Promise.all([
          axios.get("/videos"),
          axios.get("/videos/categories"),
        ])
        setVideos(videosRes.data)
        setCategories([
          { id: "all", name: "All Categories" },
          ...categoriesRes.data,
        ])
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load videos and categories")
      }
    }
    fetchData()
  }, [user])

  const formatDuration = (seconds) => {
    if (!seconds) return "00:00"
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    return hours > 0
      ? `${hours}:${mins.toString().padStart(2, "0")}:${secs
          .toString()
          .padStart(2, "0")}`
      : `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || video.category?._id === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Video Hub
          </h1>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <RiCloseLine />
                </button>
              )}
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category._id || category.id}
                    value={category._id || category.id}
                  >
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              asChild
              className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
            >
              <Link to="/video/upload" className="flex items-center gap-2">
                <RiUploadCloudLine className="text-lg" />
                <span className="hidden sm:inline">Upload Video</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 p-3">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video) => {
              const timeAgo = formatDistanceToNow(new Date(video.createdAt), {
                addSuffix: true,
              })

              return (
                <Link
                  to={`/video/${video._id}`}
                  key={video._id}
                  className="group relative block"
                >
                  <div className="relative aspect-video bg-gray-100 overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <video
                          src={video.videoUrl}
                          className="w-full h-full object-contain"
                          muted
                          preload="metadata"
                        />
                      </div>
                    )}

                    {/* Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                      <RiPlayCircleLine className="text-white text-5xl transform group-hover:scale-110 transition-transform duration-200" />
                    </div>

                    {video.isLive && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                        <RiLiveLine className="animate-pulse" />
                        LIVE
                      </div>
                    )}

                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-semibold text-gray-900 text-base line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {video.title}
                    </h3>

                    <div className="flex items-center mt-2 space-x-3">
                      <img
                        src={video.uploader?.profilePicture || "/default-profile.png"}
                        alt={video.uploader?.username || "Uploader"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {video.uploader?.username || "Unknown Creator"}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          {video.views.toLocaleString()} views • {timeAgo}
                          {video.commentCount > 0 && (
                            <span className="ml-2 text-xs text-gray-500">
                              +{video.commentCount} comment{video.commentCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <RiVideoLine className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No videos found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || selectedCategory !== "all"
                  ? "Try adjusting your search or filter"
                  : "No videos have been uploaded yet"}
              </p>
              <Button
                asChild
                className="mt-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
              >
                <Link to="/video/upload" className="flex items-center gap-2">
                  <RiUploadCloudLine className="text-lg" />
                  <span>Upload Your First Video</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DiscoverVideos