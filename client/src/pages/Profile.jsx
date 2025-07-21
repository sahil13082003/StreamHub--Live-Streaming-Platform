"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { RiGridFill, RiUserFollowLine, RiMoreLine } from 'react-icons/ri'
import VideoCard from '@/components/video/VideoCard'
import { useNavigate } from 'react-router-dom'
import axios from '@/services/api'
import { toast } from 'react-toastify'

const ProfilePage = () => {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [activeTab, setActiveTab] = useState('videos')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Fetch user's videos with Axios
  useEffect(() => {
  const fetchUserVideos = async () => {
    if (!user?._id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.get(`/videos/user/${user._id}`)
      // Verify the returned videos belong to this user
      const userVideos = response.data.filter(v => v.uploader._id === user._id)
      setVideos(userVideos)
    } catch (err) {
      console.error('Error details:', err.response?.data) // More detailed error
      setError('Failed to load videos')
      toast.error(err.response?.data?.message || 'Error loading videos')
    } finally {
      setLoading(false)
    }
  }

  fetchUserVideos()
}, [user])

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 px-4 py-6">
        <div className="flex-shrink-0">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-2 border-white">
            <AvatarImage src={user?.profilePhoto} />
            <AvatarFallback className="bg-gray-200 text-gray-700 text-xl font-medium">
              {user?.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">{user?.username}</h1>
            <Button 
              variant="outline" 
              className="rounded-md px-4 py-1.5 text-sm"
              onClick={() => navigate('/profile/edit')}
            >
              Edit Profile
            </Button>
            <Button variant="ghost" size="icon">
              <RiMoreLine className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex gap-8">
            <div className="text-center">
              <span className="font-semibold">{videos.length}</span>
              <p className="text-sm text-gray-600">Videos</p>
            </div>
            <div className="text-center">
              <span className="font-semibold">{user?.followers?.length || 0}</span>
              <p className="text-sm text-gray-600">Followers</p>
            </div>
            <div className="text-center">
              <span className="font-semibold">{user?.following?.length || 0}</span>
              <p className="text-sm text-gray-600">Following</p>
            </div>
          </div>
          
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-gray-600">{user?.bio || 'No bio yet'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-t border-gray-200 mt-4">
        <div className="flex justify-center">
          <button
            onClick={() => setActiveTab('videos')}
            className={`flex items-center gap-1 px-4 py-3 text-sm font-medium ${activeTab === 'videos' ? 'text-purple-600 border-t-2 border-purple-600' : 'text-gray-600'}`}
          >
            <RiGridFill className="w-4 h-4" />
            Videos
          </button>
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded"></div>
          ))}
        </div>
      ) : error ? (
        <div className="col-span-3 py-12 text-center">
          <p className="text-red-500">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1 mt-1">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <div className="col-span-3 py-12 text-center">
          <p className="text-gray-500">No videos uploaded yet</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/video/upload')}
          >
            Upload Video
          </Button>
        </div>
      )}
    </div>
  )
}

export default ProfilePage