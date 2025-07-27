import Video from '../models/Video.js'
import Category from '../models/Category.js'
import Comment from '../models/Comment.js'
import { uploadToImageKit } from '../middlewares/upload.js'
import getVideoDuration from 'get-video-duration'
import mongoose from 'mongoose'

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
      .populate('uploader', 'username profilePicture')
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
      .populate('uploader', 'username profilePicture')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .lean()

      const videoWithComments = await Promise.all(
        videos.map(async (video) => {
          const commentCount = await Comment.countDocuments({ video: video._id })
          return {
            ...video,
            commentCount,
          }
        })
      )

    res.json(videoWithComments)
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
      .populate('uploader', 'username profilePicture')
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
      .populate('uploader', 'username profilePicture')
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
      .populate('uploader', 'username profilePicture')
      .populate('category', 'name')
      .sort({ createdAt: -1 })

    res.json(videos)
  } catch (error) {
    console.error('Error fetching user videos:', error)
    res.status(500).json({ error: 'Failed to fetch user videos' })
  }
}

// Get comments for a video
export const getVideoComments = async (req, res) => {
  try {
    const { id } = req.params
    const comments = await Comment.find({ video: id })
      .populate('user', 'username profilePicture')
      .sort({ createdAt: -1 }) // Newest comments first
    res.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
}

// Create a new comment
export const createComment = async (req, res) => {
  try {
    const { id } = req.params // Video ID
    const { content } = req.body
    const userId = req.user.id // From auth middleware

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' })
    }

    // Create and save the comment
    const comment = new Comment({
      content,
      user: userId,
      video: id
    })
    await comment.save()

    // Add comment to video's comments array
    await Video.findByIdAndUpdate(id, { $push: { comments: comment._id } })

    // Populate user details
    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'username profilePicture')

    res.status(201).json(populatedComment)
  } catch (error) {
    console.error('Error creating comment:', error)
    res.status(500).json({ error: 'Failed to create comment' })
  }
}

// Get recommended videos
export const getRecommendedVideos = async (req, res) => {
  try {
    const { id } = req.params
    const currentVideo = await Video.findById(id).populate('uploader category')

    if (!currentVideo) {
      return res.status(404).json({ error: 'Video not found' })
    }

    const { category, uploader } = currentVideo

    // Fetch videos based on:
    // 1. Same category (excluding current video)
    // 2. Videos from users the uploader follows
    // 3. Popular videos (by views)
    const recommendedVideos = await Video.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(id) }, // Exclude current video
          $or: [
            { category: category?._id }, // Same category
            { uploader: { $in: uploader?.following || [] } }, // Videos from followed users
            { views: { $gte: 100 } } // Popular videos (arbitrary threshold)
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'uploader',
          foreignField: '_id',
          as: 'uploader'
        }
      },
      { $unwind: '$uploader' },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'video',
          as: 'comments'
        }
      },
      {
        $addFields: {
          commentCount: { $size: '$comments' }
        }
      },
      {
        $project: {
          title: 1,
          videoUrl: 1,
          thumbnailUrl: 1,
          duration: 1,
          views: 1,
          createdAt: 1,
          isLive: 1,
          commentCount: 1,
          'uploader.username': 1,
          'uploader.profilePicture': 1,
          'category.name': 1
        }
      },
      { $sort: { views: -1, createdAt: -1 } }, // Sort by views and recency
      { $limit: 5 } // Limit to 5 recommendations
    ])

    res.json(recommendedVideos)
  } catch (error) {
    console.error('Error fetching recommended videos:', error)
    res.status(500).json({ error: 'Failed to fetch recommended videos' })
  }
}