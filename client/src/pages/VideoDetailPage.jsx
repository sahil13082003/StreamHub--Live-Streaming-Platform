"use client"
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from '@/services/api'
import VideoPlayer from '@/components/video/VideoPlayer'

const VideoDetailPage = () => {
  const { id } = useParams()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`/videos/${id}`)
        setVideo(response.data)
      } catch (error) {
        console.error("Failed to fetch video:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchVideo()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!video) return <div>Video not found</div>

  return (
    <div className="max-w-7xl mx-auto p-4">
      <VideoPlayer 
        src={video.videoUrl} 
        thumbnail={video.thumbnailUrl} 
      />
      <div className="mt-6">
        <h1 className="text-2xl font-bold">{video.title}</h1>
        <p className="text-gray-600 mt-2">{video.description}</p>
        <div className="flex items-center mt-4">
          <span className="text-sm text-gray-500">
            {video.views} views • {new Date(video.createdAt).toLocaleDateString()}
          </span>
        </div>
        
      </div>
    </div>
  )
}

export default VideoDetailPage