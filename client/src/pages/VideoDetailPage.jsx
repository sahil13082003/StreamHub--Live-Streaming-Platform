"use client"

// import { useParamsprech
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import axios from '@/services/api'
import VideoPlayer from '@/components/video/VideoPlayer'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-toastify'
import { RiPlayCircleLine, RiLiveLine } from 'react-icons/ri'

const VideoDetailPage = () => {
  const { id } = useParams()
  const { user, token } = useContext(AuthContext)
  const navigate = useNavigate()
  const [video, setVideo] = useState(null)
  const [comments, setComments] = useState([])
  const [recommendedVideos, setRecommendedVideos] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentLoading, setCommentLoading] = useState(false)

  // Fetch video, comments, and recommended videos
  useEffect(() => {
    const fetchVideoAndComments = async () => {
      try {
        const [videoResponse, commentsResponse, recommendedResponse] = await Promise.all([
          axios.get(`/videos/${id}`),
          axios.get(`/videos/${id}/comments`),
          axios.get(`/videos/${id}/recommended`)
        ])
        setVideo(videoResponse.data)
        setComments(commentsResponse.data)
        setRecommendedVideos(recommendedResponse.data)
      } catch (error) {
        console.error("Failed to fetch video or comments:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchVideoAndComments()
  }, [id])

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!user || !token) {
      toast.error(
        <div className="flex flex-col gap-2">
          <span>Please log in to post a comment.</span>
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
      return
    }

    if (!newComment.trim()) {
      toast.error("Comment cannot be empty", {
        position: "top-center",
        autoClose: 3000,
      })
      return
    }

    setCommentLoading(true)
    try {
      const response = await axios.post(
        `/videos/${id}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setComments([response.data, ...comments])
      setNewComment('')
      toast.success("Comment posted successfully!", {
        position: "top-center",
        autoClose: 3000,
      })
    } catch (error) {
      console.error("Failed to post comment:", error)
      toast.error("Failed to post comment", {
        position: "top-center",
        autoClose: 3000,
      })
    } finally {
      setCommentLoading(false)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return "00:00"
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return hours > 0
      ? `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      : `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (loading) return (
    <div className="text-center mt-10">
      <div className="w-8 h-8 mx-auto animate-spin text-purple-500" />
    </div>
  )
  if (!video) return <div className="text-center mt-10 text-red-500">Video not found</div>

  const timeAgo = formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <VideoPlayer
          src={video.videoUrl}
          thumbnail={video.thumbnailUrl}
        />

        <div className="mt-6">
          <h1 className="text-3xl font-semibold text-gray-900">{video.title}</h1>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-3">
              <img
                src={video.uploader?.profilePicture || "/default-profile.png"}
                alt={video.uploader?.username || "Uploader"}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {video.uploader?.username || "Unknown Creator"}
                </p>
                <p className="text-xs text-gray-500">{video.views} views • {timeAgo}</p>
              </div>
            </div>
          </div>

          <p className="text-gray-700 mt-6 leading-relaxed">{video.description}</p>

          {/* Comments Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Comments ({comments.length})</h2>

            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex gap-4">
                <Input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-lg"
                  disabled={commentLoading}
                />
                <Button
                  type="submit"
                  className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
                  disabled={commentLoading}
                >
                  {commentLoading ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </form>

            {comments.length === 0 ? (
              <p className="text-gray-500">No comments yet. Be the first to comment!</p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3 border-b border-gray-200 pb-4">
                    <img
                      src={comment.user?.profilePicture || '/default-profile.png'}
                      alt={comment.user?.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-800">{comment.user?.username || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommended Videos Section */}
      {recommendedVideos.length > 0 && (
        <div className="w-full lg:w-80 xl:w-96">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recommended Videos</h2>
          <div className="space-y-4">
            {recommendedVideos.map((video) => (
              <Link
                to={`/video/${video._id}`}
                key={video._id}
                className="group relative block"
              >
                <div className="relative aspect-video bg-gray-100 overflow-hidden rounded-lg">
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

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                    <RiPlayCircleLine className="text-white text-4xl transform group-hover:scale-110 transition-transform duration-200" />
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

                <div className="mt-2">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center mt-1 space-x-2">
                    <img
                      src={video.uploader?.profilePicture || "/default-profile.png"}
                      alt={video.uploader?.username || "Uploader"}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-medium text-gray-800">
                        {video.uploader?.username || "Unknown Creator"}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        {video.views.toLocaleString()} views
                        {video.commentCount > 0 && (
                          <span className="ml-1">
                            • +{video.commentCount} comment{video.commentCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoDetailPage