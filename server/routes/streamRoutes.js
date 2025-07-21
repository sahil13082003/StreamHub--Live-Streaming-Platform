// server/routes/streamRoutes.js
import express from 'express'
import {
  startStream,
  updateStreamStatus,
  endStream,
  getStream,
  getLiveStreams,
  getStreamers,
  followStreamer,
  unfollowStreamer,
  // getStreamCategories
} from '../controllers/streamController.js'
import { protect, isStreamer } from '../middlewares/authMiddleware.js'

const router = express.Router()

// Public routes
router.get('/live', getLiveStreams)
// router.get('/categories', getStreamCategories)
router.get('/:id', getStream)

// Protected routes
router.use(protect)

// Streamer routes
router.post('/start', isStreamer, startStream)
router.patch('/:id/status', isStreamer, updateStreamStatus)
router.delete('/:id', isStreamer, endStream)
router.get('/live', getLiveStreams);

router.get('/streamers', getStreamers);
router.post('/streamers/:id/follow', protect, followStreamer);
router.post('/streamers/:id/unfollow', protect, unfollowStreamer);

export default router