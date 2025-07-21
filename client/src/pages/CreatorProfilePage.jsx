"use client"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/useAuth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { RiUserFollowLine, RiUserUnfollowLine, RiLiveLine } from "react-icons/ri"
import axios from "@/services/api"
import { toast } from "react-toastify"
import VideoCard from "@/components/video/VideoCard"

const CreatorProfilePage = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [creator, setCreator] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCreatorData = async () => {
      try {
        const [creatorRes, videosRes] = await Promise.all([
          axios.get(`/creators/${id}`),
          axios.get(`/videos/creator/${id}`)
        ])
        setCreator(creatorRes.data)
        setVideos(videosRes.data)
      } catch (error) {
        console.error("Failed to fetch creator data:", error)
        toast.error("Failed to load creator profile")
        navigate("/creators")
      } finally {
        setLoading(false)
      }
    }
    fetchCreatorData()
  }, [id])

  const handleFollow = async () => {
    if (!user) {
      toast.info("Please login to follow creators")
      return navigate("/login")
    }

    try {
      await axios.post(`/creators/${id}/follow`)
      setCreator(prev => ({
        ...prev,
        followers: [...prev.followers, user._id]
      }))
      toast.success(`You're now following ${creator.username}!`)
    } catch (error) {
      console.error("Follow error:", error)
      toast.error(error.response?.data?.message || "Failed to follow creator")
    }
  }

  const handleUnfollow = async () => {
    try {
      await axios.post(`/creators/${id}/unfollow`)
      setCreator(prev => ({
        ...prev,
        followers: prev.followers.filter(followerId => followerId !== user._id)
      }))
      toast.success(`You've unfollowed ${creator.username}`)
    } catch (error) {
      console.error("Unfollow error:", error)
      toast.error(error.response?.data?.message || "Failed to unfollow creator")
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!creator) {
    return <div className="min-h-screen flex items-center justify-center">Creator not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Creator Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 px-4 py-6">
        <div className="flex-shrink-0">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-white">
            <AvatarImage src={creator.profilePhoto} />
            <AvatarFallback className="bg-gray-200 text-gray-700 text-xl font-medium">
              {creator.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">{creator.username}</h1>
            {user?._id === creator._id ? (
              <Button 
                variant="outline" 
                className="rounded-md px-4 py-1.5 text-sm"
                onClick={() => navigate('/profile/edit')}
              >
                Edit Profile
              </Button>
            ) : user?.following?.includes(creator._id) ? (
              <Button 
                variant="outline" 
                className="rounded-md px-4 py-1.5 text-sm gap-2"
                onClick={handleUnfollow}
              >
                <RiUserUnfollowLine />
                Following
              </Button>
            ) : (
              <Button 
                className="rounded-md px-4 py-1.5 text-sm gap-2 bg-purple-500 hover:bg-purple-600"
                onClick={handleFollow}
              >
                <RiUserFollowLine />
                Follow
              </Button>
            )}
          </div>
          
          <div className="flex gap-8">
            <div className="text-center">
              <span className="font-semibold">{videos.length}</span>
              <p className="text-sm text-gray-600">Videos</p>
            </div>
            <div className="text-center">
              <span className="font-semibold">{creator.followers.length}</span>
              <p className="text-sm text-gray-600">Followers</p>
            </div>
          </div>
          
          <div>
            <p className="font-medium">{creator.name}</p>
            <p className="text-sm text-gray-600">{creator.bio || 'No bio yet'}</p>
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 mt-1">
        {videos.length > 0 ? (
          videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))
        ) : (
          <div className="col-span-3 py-12 text-center">
            <p className="text-gray-500">No videos uploaded yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreatorProfilePage