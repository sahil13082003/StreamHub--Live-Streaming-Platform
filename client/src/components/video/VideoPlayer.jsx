// components/VideoPlayer.jsx
"use client"

import { useEffect, useRef } from 'react'

const VideoPlayer = ({ src, thumbnail, autoPlay = false }) => {
  const videoRef = useRef(null)

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(e => console.log("Autoplay prevented:", e))
    }
  }, [autoPlay])

  return (
    <div className="relative w-full aspect-video bg-black">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        controls
        playsInline
        poster={thumbnail}
        preload="metadata"
      />
    </div>
  )
}

export default VideoPlayer