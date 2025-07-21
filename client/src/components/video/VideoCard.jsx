"use client"
import { RiPlayFill } from 'react-icons/ri'
import { useNavigate } from 'react-router-dom'

const VideoCard = ({ video }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/video/${video._id}`)
  }

  return (
    <div 
      onClick={handleClick}
      className="group relative aspect-square cursor-pointer"
    >
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
        <RiPlayFill className="text-white text-3xl opacity-90" />
      </div>
      <img
        src={video.thumbnailUrl || '/placeholder-thumbnail.jpg'}
        alt={video.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
        {video.views} views
      </div>
    </div>
  )
}

export default VideoCard