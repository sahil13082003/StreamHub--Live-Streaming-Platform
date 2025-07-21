"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RiUploadCloudLine } from "react-icons/ri"
import { toast } from "react-toastify"
import axios from "@/services/api"
import { useAuth } from "@/context/useAuth"

const UploadVideo = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    video: null,
    thumbnail: null
  })

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login')
      toast.info('Please login to upload videos')
    }
  }, [user, navigate])

  // Fetch categories from backend
  useEffect(() => {
    if (!user) return // Don't fetch if not logged in

    const fetchCategories = async () => {
      try {
        const response = await axios.get("/videos/categories")
        setCategories(response.data)
      } catch (error) {
        console.error("Failed to fetch categories:", error)
        toast.error("Failed to load categories")
      }
    }
    fetchCategories()
  }, [user])

  const handleFileUpload = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error("Please login to upload videos")
      return navigate('/login')
    }

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

      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          setUploadProgress(percentCompleted)
        },
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      }

      await axios.post("/videos/upload", formDataToSend, config)
      toast.success("Video uploaded successfully!")
      navigate('/video') // Redirect to video list after successful upload
    } catch (error) {
      console.error("Upload error:", error)
      const errorMsg = error.response?.data?.error || "Failed to upload video"
      toast.error(errorMsg)
      
      if (error.response?.status === 401) {
        navigate('/login')
      }
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
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
                    {categories.map((category) => (
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
      </div>
    </div>
  )
}

export default UploadVideo