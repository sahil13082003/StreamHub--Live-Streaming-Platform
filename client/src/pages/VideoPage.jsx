"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RiUploadCloudLine, RiVideoLine, RiLiveLine, RiSearchLine, RiCloseLine } from "react-icons/ri"
import { toast } from "react-toastify"
import axios from "@/services/api"
import { useAuth } from "@/context/useAuth"

const VideoPage = () => {
  const [activeTab, setActiveTab] = useState("discover")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [videos, setVideos] = useState([])
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    video: null,
    thumbnail: null
  })
  const { user } = useAuth()

  // Fetch videos and categories from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videosRes, categoriesRes] = await Promise.all([
          axios.get("/videos"),
          axios.get("/videos/categories")
        ])
        setVideos(videosRes.data)
        setCategories([{ id: "all", name: "All Categories" }, ...categoriesRes.data])
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load videos and categories")
      }
    }
    fetchData()
  }, [])

  const formatDuration = (seconds) => {
    if (!seconds) return "00:00"
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    return hours > 0
      ? `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleFileUpload = async (e) => {
    e.preventDefault()
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("video", formData.video)
      if (formData.thumbnail) {
        formDataToSend.append("thumbnail", formData.thumbnail)
      }

      // Configure progress tracking
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setUploadProgress(percentCompleted)
        },
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }

      const response = await axios.post("/videos/upload", formDataToSend, config)

      // Add the new video to the list
      setVideos(prevVideos => [response.data, ...prevVideos])
      setActiveTab("discover")
      toast.success("Video uploaded successfully!")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(error.response?.data?.error || "Failed to upload video")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      setFormData({
        title: "",
        description: "",
        category: "",
        video: null,
        thumbnail: null
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    setFormData(prev => ({ ...prev, [name]: files[0] }))
  }

  const filteredVideos = videos.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || video.category?._id === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Video Hub</h1>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
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
              <SelectTrigger className="w-[180px] border-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category._id || category.id} value={category._id || category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === "discover" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("discover")}
          >
            Discover Content
          </button>
          {user && (
            <button
              className={`px-4 py-2 font-medium text-sm ${activeTab === "upload" ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("upload")}
            >
              Upload Video
            </button>
          )}
        </div>

        {activeTab === "upload" ? (
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <RiUploadCloudLine className="text-purple-500" />
                Upload New Video
              </CardTitle>
              <CardDescription>
                Share your content with the community. Supported formats: MP4, WebM, MOV (MAX. 100MB).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="title">Video Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter a descriptive title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Tell viewers about your video"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    name="category"
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    required
                  >
                    <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(c => c._id).map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="video">Video File *</Label>
                  <Input
                    id="video"
                    name="video"
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleFileChange}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="thumbnail">Thumbnail *</Label>
                  <Input
                    id="thumbnail"
                    name="thumbnail"
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileChange}
                    className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2 bg-gray-200" />
                  </div>
                )}

                <CardFooter className="flex justify-end px-0 pb-0">
                  <Button
                    type="submit"
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Publish Video"}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.length > 0 ? (
              filteredVideos.map((video) => (
                <Link to={`/video/${video._id}`} key={video._id} className="group">
                  <Card className="border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative aspect-video bg-gray-200 overflow-hidden">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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

                      {video.isLive && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                          <RiLiveLine className="animate-pulse" />
                          LIVE
                        </div>
                      )}

                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-purple-600">
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {video.views.toLocaleString()} views • {video.category?.name || "Uncategorized"}
                      </p>
                      {video.uploader && (
                        <div className="flex items-center mt-2">
                          <img
                            src={video.uploader.avatar}
                            alt={video.uploader.name}
                            className="w-6 h-6 rounded-full mr-2"
                          />
                          <span className="text-sm text-gray-600">{video.uploader.name}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <RiVideoLine className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No videos found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || selectedCategory !== "all"
                    ? "Try adjusting your search or filter"
                    : "No videos have been uploaded yet"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoPage