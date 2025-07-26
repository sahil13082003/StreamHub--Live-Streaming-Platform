// src/pages/stream/Watch.jsx
"use client"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-toastify"
import { RiLiveLine, RiHeartLine, RiShareLine, RiSendPlaneLine } from "react-icons/ri"
import axios from "axios"

const Watch = () => {
  const { streamId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [stream, setStream] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chatMessages, setChatMessages] = useState([])
  const [message, setMessage] = useState("")
  const [isFollowing, setIsFollowing] = useState(false)
  const [viewerCount, setViewerCount] = useState(0)
  const ws = useRef(null)

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const response = await axios.get(`/streams/${streamId}`)
        if (!response.data.isLive) {
          navigate("/home")
          toast.error("This stream has ended")
          return
        }
        setStream(response.data)
        setIsFollowing(user?.following?.includes(response.data.streamer._id))
      } catch (error) {
        console.error("Failed to fetch stream:", error)
        toast.error("Failed to load stream")
        navigate("/home")
      } finally {
        setLoading(false)
      }
    }

    fetchStream()

    // Setup WebSocket for stream data and chat
    ws.current = new WebSocket(`${process.env.NODE_ENV === 'development' ? 'ws' : 'wss'}://${window.location.host}/ws/watch/${streamId}`)

    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({
        type: "AUTH",
        token: localStorage.getItem("token")
      }))
    }

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      switch (data.type) {
        case "VIEWER_COUNT":
          setViewerCount(data.count)
          break
        case "CHAT_MESSAGE":
          setChatMessages(prev => [...prev, data.message])
          break
        case "STREAM_ENDED":
          toast.info("Stream has ended")
          navigate("/home")
          break
      }
    }

    return () => {
      if (ws.current) ws.current.close()
    }
  }, [streamId, user, navigate])

  const handleSendMessage = () => {
    if (!message.trim() || !ws.current) return

    ws.current.send(JSON.stringify({
      type: "CHAT_MESSAGE",
      content: message,
      sender: user._id
    }))
    setMessage("")
  }

  const handleFollow = async () => {
    try {
      await axios.post(`/streamers/${stream.streamer._id}/follow`)
      setIsFollowing(true)
      toast.success(`You're now following ${stream.streamer.username}`)
    } catch (error) {
      console.error("Failed to follow:", error)
      toast.error("Failed to follow streamer")
    }
  }

  const handleUnfollow = async () => {
    try {
      await axios.post(`/streamers/${stream.streamer._id}/unfollow`)
      setIsFollowing(false)
      toast.success(`You've unfollowed ${stream.streamer.username}`)
    } catch (error) {
      console.error("Failed to unfollow:", error)
      toast.error("Failed to unfollow streamer")
    }
  }

  const copyStreamLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/stream/${streamId}`)
    toast.success("Stream link copied to clipboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!stream) return null

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Stream */}
          <div className="flex-1">
            <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                controls
                className="w-full h-full object-cover"
              >
                <source src={`/stream/${streamId}/playlist.m3u8`} type="application/x-mpegURL" />
              </video>

              {/* Stream Info Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h1 className="text-xl font-bold">{stream.title}</h1>
                <p className="text-sm text-gray-300">{stream.description}</p>
              </div>

              {/* Viewer Count */}
              <div className="absolute top-4 left-4 bg-black bg-opacity-70 px-3 py-1 rounded-full flex items-center gap-1">
                <RiLiveLine className="text-red-500 animate-pulse" />
                <span className="text-sm">{viewerCount} viewers</span>
              </div>
            </div>

            {/* Streamer Info */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-700">
                  <img
                    src={stream.streamer.profilePhoto}
                    alt={stream.streamer.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium">{stream.streamer.username}</h3>
                  <p className="text-sm text-gray-400">{stream.category?.name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {isFollowing ? (
                  <Button
                    variant="outline"
                    onClick={handleUnfollow}
                    className="gap-2"
                  >
                    <RiHeartLine className="fill-current" />
                    Following
                  </Button>
                ) : (
                  <Button
                    onClick={handleFollow}
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <RiHeartLine />
                    Follow
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={copyStreamLink}
                  className="gap-2"
                >
                  <RiShareLine />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="lg:w-80 bg-gray-800 rounded-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-700">
              <h2 className="font-semibold">Stream Chat</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.length > 0 ? (
                chatMessages.map((msg, index) => (
                  <div key={index} className="break-words">
                    <span className="font-medium text-purple-400">
                      {msg.sender.username}:
                    </span>{" "}
                    <span>{msg.content}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 mt-10">
                  No messages yet. Be the first to chat!
                </p>
              )}
            </div>
            <div className="p-4 border-t border-gray-700">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Send a message..."
                  className="flex-1 bg-gray-700 border-gray-600"
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button
                  onClick={handleSendMessage}
                  className="gap-2"
                  disabled={!message.trim()}
                >
                  <RiSendPlaneLine />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Watch