// server/routes/streamerRoutes.js
import express from 'express';
import {
  getAllStreamers,
  getStreamerProfile,
  getStreamerVideos,
  followStreamer,
  unfollowStreamer,
  checkFollowingStatus
} from '../controllers/streamerController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllStreamers);
router.get('/:id', getStreamerProfile);
router.get('/:id/videos', getStreamerVideos);

// Protected routes
router.use(protect);
router.get('/:id/following-status', checkFollowingStatus);
router.post('/:id/follow', followStreamer);
router.post('/:id/unfollow', unfollowStreamer);

export default router;