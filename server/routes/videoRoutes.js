import express from 'express'
import { uploadMiddleware } from '../middlewares/upload.js'
import { 
  uploadVideo, 
  getVideos, 
  getVideo, 
  getVideosByCategory,
  getCategories, 
  getVideosByUser,
  getVideoComments,
  createComment,
  getRecommendedVideos
} from '../controllers/videoController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post(
  '/upload',
  protect,
  uploadMiddleware,
  uploadVideo
)

router.get('/', getVideos)
router.get('/categories', getCategories)
router.get('/category/:categoryId', getVideosByCategory)
router.get('/:id', getVideo)
router.get('/user/:userId', protect, getVideosByUser)
router.get('/:id/comments', getVideoComments)
router.post('/:id/comments', protect, createComment)
router.get('/:id/recommended', getRecommendedVideos)

export default router