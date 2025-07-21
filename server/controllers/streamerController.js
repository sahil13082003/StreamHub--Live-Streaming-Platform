// server/controllers/streamerController.js
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Video from '../models/Video.js';
import Stream from '../models/Stream.js';
import { errorHandler } from '../middlewares/errorMiddleware.js';

// Get all streamers
export const getAllStreamers = async (req, res, next) => {
  try {
    const streamers = await User.find({ role: 'streamer' })
      .select('-password -email -streamKey')
      .populate('followers', 'username profilePhoto')
      .populate('following', 'username profilePhoto');
    res.status(200).json(streamers);
  } catch (err) {
    next(errorHandler(500, 'Failed to fetch streamers'));
  }
};

// Get streamer profile
export const getStreamerProfile = async (req, res, next) => {
  try {
    const streamer = await User.findById(req.params.id)
      .select('-password -email -streamKey')
      .populate('followers', 'username profilePhoto')
      .populate('following', 'username profilePhoto');
    
    if (!streamer || streamer.role !== 'streamer') {
      return next(errorHandler(404, 'Streamer not found'));
    }

    res.status(200).json(streamer);
  } catch (err) {
    next(errorHandler(500, 'Failed to fetch streamer profile'));
  }
};

// Follow a streamer
export const followStreamer = async (req, res, next) => {
  try {
    const streamer = await User.findById(req.params.id);
    if (!streamer || streamer.role !== 'streamer') {
      return next(errorHandler(404, 'Streamer not found'));
    }

    // Check if already following
    if (streamer.followers.includes(req.user.id)) {
      return next(errorHandler(400, 'Already following this streamer'));
    }

    // Update streamer's followers
    streamer.followers.push(req.user.id);
    await streamer.save();

    // Update user's following
    const user = await User.findById(req.user.id);
    user.following.push(streamer._id);
    await user.save();

    res.status(200).json({ 
      success: true,
      message: 'Successfully followed streamer',
      followersCount: streamer.followers.length
    });
  } catch (err) {
    next(errorHandler(500, 'Failed to follow streamer'));
  }
};

// Unfollow a streamer
export const unfollowStreamer = async (req, res, next) => {
  try {
    const streamer = await User.findById(req.params.id);
    if (!streamer || streamer.role !== 'streamer') {
      return next(errorHandler(404, 'Streamer not found'));
    }

    // Check if not following
    if (!streamer.followers.includes(req.user.id)) {
      return next(errorHandler(400, 'Not following this streamer'));
    }

    // Update streamer's followers
    streamer.followers = streamer.followers.filter(
      followerId => followerId.toString() !== req.user.id
    );
    await streamer.save();

    // Update user's following
    const user = await User.findById(req.user.id);
    user.following = user.following.filter(
      followingId => followingId.toString() !== streamer._id.toString()
    );
    await user.save();

    res.status(200).json({ 
      success: true,
      message: 'Successfully unfollowed streamer',
      followersCount: streamer.followers.length
    });
  } catch (err) {
    next(errorHandler(500, 'Failed to unfollow streamer'));
  }
};

// Get streamer's videos
export const getStreamerVideos = async (req, res, next) => {
  try {
    const videos = await Video.find({ uploader: req.params.id })
      .populate('uploader', 'username profilePhoto role')
      .populate('category', 'name');
      
    // Check if uploader is a streamer
    if (videos.length > 0 && videos[0].uploader.role !== 'streamer') {
      return next(errorHandler(404, 'This user is not a streamer'));
    }

    res.status(200).json(videos);
  } catch (err) {
    next(errorHandler(500, 'Failed to fetch streamer videos'));
  }
};

// Check if user is following a streamer
export const checkFollowingStatus = async (req, res, next) => {
  try {
    const streamer = await User.findById(req.params.id);
    if (!streamer || streamer.role !== 'streamer') {
      return next(errorHandler(404, 'Streamer not found'));
    }

    const isFollowing = streamer.followers.includes(req.user.id);
    res.status(200).json({ isFollowing });
  } catch (err) {
    next(errorHandler(500, 'Failed to check following status'));
  }
};