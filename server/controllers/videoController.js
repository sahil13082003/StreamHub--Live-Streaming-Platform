import Video from '../models/Video.js'
import Category from '../models/Category.js'
import { uploadToImageKit } from '../middlewares/upload.js'
import getVideoDuration from 'get-video-duration'

// Upload video
export const uploadVideo = async (req, res) => {
  try {
    const { title, description, category } = req.body
    const userId = req.user.id

    if (!req.files.video) {
      return res.status(400).json({ error: 'Video file is required' })
    }

    // Upload video to ImageKit
    const videoFile = req.files.video[0]
    const videoUpload = await uploadToImageKit(
      videoFile,
      'streamhub/videos',
      `${title}-${Date.now()}`
    )

    // Upload thumbnail if provided
    let thumbnailUpload = null
    if (req.files.thumbnail) {
      const thumbnailFile = req.files.thumbnail[0]
      thumbnailUpload = await uploadToImageKit(
        thumbnailFile,
        'streamhub/thumbnails',
        `${title}-thumbnail-${Date.now()}`
      )
    }

    

    // Create video document
    const video = new Video({
      title,
      description,
      uploader: userId,
      category,
      videoUrl: videoUpload.url,
      thumbnailUrl: thumbnailUpload?.url || null,
      duration: videoFile.mimetype.startsWith('video/') ,
      views: 0
    })

    await video.save()

    // Populate uploader and category details
    const populatedVideo = await Video.findById(video._id)
      .populate('uploader', 'name avatar')
      .populate('category', 'name')

    res.status(201).json(populatedVideo)
  } catch (error) {
    console.error('Error uploading video:', error)
    res.status(500).json({ error: 'Failed to upload video' })
  }
}

// Get all videos
export const getVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .populate('uploader', 'name avatar')
      .populate('category', 'name')
      .sort({ createdAt: -1 })

    res.json(videos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    res.status(500).json({ error: 'Failed to fetch videos' })
  }
}

// Get videos by category
export const getVideosByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params
    const videos = await Video.find({ category: categoryId })
      .populate('uploader', 'name avatar')
      .populate('category', 'name')
      .sort({ createdAt: -1 })

    res.json(videos)
  } catch (error) {
    console.error('Error fetching videos by category:', error)
    res.status(500).json({ error: 'Failed to fetch videos' })
  }
}

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
}

// Get single video
export const getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('uploader', 'name avatar')
      .populate('category', 'name')
      // .populate('comments.user', 'name avatar')

    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    // Increment view count
    video.views += 1
    await video.save()

    res.json(video)
  } catch (error) {
    console.error('Error fetching video:', error)
    res.status(500).json({ error: 'Failed to fetch video' })
  }
}

export const getVideosByUser = async (req, res) => {
  try {
    const videos = await Video.find({ uploader: req.params.userId })
      .populate('uploader', 'name avatar')
      .populate('category', 'name')
      .sort({ createdAt: -1 })

    res.json(videos)
  } catch (error) {
    console.error('Error fetching user videos:', error)
    res.status(500).json({ error: 'Failed to fetch user videos' })
  }
}