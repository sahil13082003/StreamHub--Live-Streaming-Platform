// // server/controllers/streamController.js
// import Stream from '../models/Stream.js';
// import User from '../models/User.js';
// import Category from '../models/Category.js'; // Import Category model
// import { errorHandler } from '../middlewares/errorMiddleware.js';
// import { v4 as uuidv4 } from 'uuid';
// import jwt from 'jsonwebtoken'; // Added missing import
// import mongoose from 'mongoose'; // Added for ObjectId validation
// import WebSocket from 'ws'; // Added for WebSocket type checking

// // Start a new stream
// export const startStream = async (req, res, next) => {
//   try {
//     const streamKey = uuidv4();
    
//     const stream = new Stream({
//       ...req.body,
//       streamer: req.user.id,
//       streamKey,
//       isLive: false
//     });

//     await stream.save();
    
//     // Update user's isLive status
//     await User.findByIdAndUpdate(req.user.id, { isLive: true, currentStream: stream._id });

//     res.status(201).json({
//       message: 'Stream created successfully',
//       streamId: stream._id,
//       streamKey
//     });
//   } catch (err) {
//     console.error('Start stream error:', err);
//     next(err);
//   }
// };

// // Update stream status
// export const updateStreamStatus = async (req, res, next) => {
//   try {
//     const { isLive } = req.body;
    
//     if (!mongoose.isValidObjectId(req.params.id)) {
//       return next(errorHandler(400, 'Invalid stream ID'));
//     }

//     const stream = await Stream.findByIdAndUpdate(
//       req.params.id,
//       { isLive, ...(isLive ? {} : { endTime: Date.now() }) },
//       { new: true }
//     );

//     if (!stream) {
//       return next(errorHandler(404, 'Stream not found'));
//     }

//     // Update user's isLive status
//     await User.findByIdAndUpdate(stream.streamer, { 
//       isLive,
//       ...(isLive ? {} : { currentStream: null })
//     });

//     res.status(200).json({ message: 'Stream status updated' });
//   } catch (err) {
//     console.error('Update stream status error:', err);
//     next(err);
//   }
// };

// // End a stream
// export const endStream = async (req, res, next) => {
//   try {
//     if (!mongoose.isValidObjectId(req.params.id)) {
//       return next(errorHandler(400, 'Invalid stream ID'));
//     }

//     const stream = await Stream.findByIdAndDelete(req.params.id);

//     if (!stream) {
//       return next(errorHandler(404, 'Stream not found'));
//     }

//     // Update user's isLive status
//     await User.findByIdAndUpdate(stream.streamer, { 
//       isLive: false,
//       currentStream: null 
//     });

//     res.status(200).json({ message: 'Stream ended successfully' });
//   } catch (err) {
//     console.error('End stream error:', err);
//     next(err);
//   }
// };

// // export const getLiveStreams = async (req, res, next) => {
// //   try {
// //     const streams = await Stream.find({ isLive: true }).populate('streamer category');
// //     res.status(200).json(streams);
// //   } catch (err) {
// //     next(err);
// //   }
// // };

// // Get stream by ID
// export const getStream = async (req, res, next) => {
//   try {
//     if (!mongoose.isValidObjectId(req.params.id)) {
//       return next(errorHandler(400, 'Invalid stream ID'));
//     }

//     const stream = await Stream.findById(req.params.id)
//       .populate('streamer', 'username profilePhoto followers')
//       .populate('category', 'name');

//     if (!stream) {
//       return next(errorHandler(404, 'Stream not found'));
//     }

//     if (!stream.streamer) {
//       return next(errorHandler(500, 'Streamer data not found for this stream'));
//     }

//     // Check if stream is private and user is a follower
//     if (stream.isPrivate && req.user?.id !== stream.streamer._id.toString()) {
//       if (!req.user) {
//         return next(errorHandler(401, 'Authentication required to view private stream'));
//       }
//       const isFollower = stream.streamer.followers.includes(req.user.id);
//       if (!isFollower) {
//         return next(errorHandler(403, 'This is a private stream for followers only'));
//       }
//     }

//     res.status(200).json(stream);
//   } catch (err) {
//     console.error('Get stream error:', err);
//     next(err);
//   }
// };

// // Get live streams
// export const getLiveStreams = async (req, res, next) => {
//   try {
//     const streams = await Stream.find({ isLive: true })
//       .populate('streamer', 'username profilePhoto')
//       .populate('category', 'name')
//       .sort({ viewers: -1 });

//     res.status(200).json(streams);
//   } catch (err) {
//     console.error('Get live streams error:', err);
//     next(err);
//   }
// };

// // Get stream categories
// export const getStreamCategories = async (req, res, next) => {
//   try {
//     const categories = await Category.find({ type: 'stream' });
//     res.status(200).json(categories);
//   } catch (err) {
//     console.error('Get stream categories error:', err);
//     next(err);
//   }
// };

// // WebSocket handlers for stream
// export const handleStreamWebSocket = (wss) => {
//   wss.on('connection', (ws, req) => {
//     const streamId = req.url.split('/').pop();
//     console.log('WebSocket connection for streamId:', streamId);
//     let userId = null;

//     // Authenticate connection
//     ws.on('message', async (message) => {
//       try {
//         const data = JSON.parse(message);

//         if (data.type === 'AUTH') {
//           if (!data.token) {
//             ws.close(1008, 'No token provided');
//             return;
//           }
//           const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
//           userId = decoded.id;

//           if (!mongoose.isValidObjectId(streamId)) {
//             ws.close(1008, 'Invalid stream ID');
//             return;
//           }

//           // Join the stream room
//           ws.streamId = streamId;
//           ws.userId = userId;

//           // Update viewer count
//           const stream = await Stream.findByIdAndUpdate(
//             streamId,
//             { $inc: { viewers: 1 } },
//             { new: true }
//           );

//           if (!stream) {
//             ws.close(1008, 'Stream not found');
//             return;
//           }

//           // Broadcast new viewer count
//           wss.clients.forEach(client => {
//             if (client.streamId === streamId && client.readyState === WebSocket.OPEN) {
//               client.send(JSON.stringify({
//                 type: 'VIEWER_COUNT',
//                 count: stream.viewers
//               }));
//             }
//           });
//         }

//         if (data.type === 'CHAT_MESSAGE' && userId) {
//           // Broadcast chat message to all clients in this stream
//           const user = await User.findById(userId).select('username');
//           if (!user) {
//             ws.close(1008, 'User not found');
//             return;
//           }

//           wss.clients.forEach(client => {
//             if (client.streamId === streamId && client.readyState === WebSocket.OPEN) {
//               client.send(JSON.stringify({
//                 type: 'CHAT_MESSAGE',
//                 message: {
//                   sender: { _id: userId, username: user.username },
//                   content: data.content,
//                   timestamp: new Date()
//                 }
//               }));
//             }
//           });
//         }
//       } catch (err) {
//         console.error('WebSocket message error:', err);
//         ws.close(1008, 'Invalid message or authentication');
//       }
//     });

//     ws.on('close', async () => {
//       if (userId && streamId && mongoose.isValidObjectId(streamId)) {
//         try {
//           // Update viewer count
//           const stream = await Stream.findByIdAndUpdate(
//             streamId,
//             { $inc: { viewers: -1 } },
//             { new: true }
//           );

//           if (stream) {
//             // Broadcast new viewer count
//             wss.clients.forEach(client => {
//               if (client.streamId === streamId && client.readyState === WebSocket.OPEN) {
//                 client.send(JSON.stringify({
//                   type: 'VIEWER_COUNT',
//                   count: stream.viewers
//                 }));
//               }
//             });
//           }
//         } catch (err) {
//           console.error('WebSocket close error:', err);
//         }
//       }
//     });

//     ws.on('error', (err) => {
//       console.error('WebSocket error:', err);
//     });
//   });
// };

import jwt from 'jsonwebtoken';
import Stream from '../models/Stream.js';
import User from '../models/User.js';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
import { errorHandler } from '../middlewares/errorMiddleware.js';

// Start a new stream
export const startStream = async (req, res, next) => {
  try {
    const streamKey = uuidv4();
    
    const stream = new Stream({
      ...req.body,
      streamer: req.user.id,
      streamKey,
      isLive: false
    });

    await stream.save();
    
    // Update user's isLive status
    await User.findByIdAndUpdate(req.user.id, { isLive: true, currentStream: stream._id });

    res.status(201).json({
      message: 'Stream created successfully',
      streamId: stream._id,
      streamKey
    });
  } catch (err) {
    console.error('Start stream error:', err);
    next(err);
  }
};

// Update stream status
export const updateStreamStatus = async (req, res, next) => {
  try {
    const { isLive } = req.body;
    
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(errorHandler(400, 'Invalid stream ID'));
    }

    const stream = await Stream.findByIdAndUpdate(
      req.params.id,
      { isLive, ...(isLive ? {} : { endTime: Date.now() }) },
      { new: true }
    );

    if (!stream) {
      return next(errorHandler(404, 'Stream not found'));
    }

    // Update user's isLive status
    await User.findByIdAndUpdate(stream.streamer, { 
      isLive,
      ...(isLive ? {} : { currentStream: null })
    });

    res.status(200).json({ message: 'Stream status updated' });
  } catch (err) {
    console.error('Update stream status error:', err);
    next(err);
  }
};

// End a stream
export const endStream = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(errorHandler(400, 'Invalid stream ID'));
    }

    const stream = await Stream.findByIdAndDelete(req.params.id);

    if (!stream) {
      return next(errorHandler(404, 'Stream not found'));
    }

    // Update user's isLive status
    await User.findByIdAndUpdate(stream.streamer, { 
      isLive: false,
      currentStream: null 
    });

    res.status(200).json({ message: 'Stream ended successfully' });
  } catch (err) {
    console.error('End stream error:', err);
    next(err);
  }
};

// Get stream by ID
export const getStream = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(errorHandler(400, 'Invalid stream ID'));
    }

    const stream = await Stream.findById(req.params.id)
      .populate('streamer', 'username profilePhoto followers')
      .populate('category', 'name');

    if (!stream) {
      return next(errorHandler(404, 'Stream not found'));
    }

    if (!stream.streamer) {
      return next(errorHandler(500, 'Streamer data not found for this stream'));
    }

    // Check if stream is private and user is a follower
    if (stream.isPrivate && req.user?.id !== stream.streamer._id.toString()) {
      if (!req.user) {
        return next(errorHandler(401, 'Authentication required to view private stream'));
      }
      const isFollower = stream.streamer.followers.includes(req.user.id);
      if (!isFollower) {
        return next(errorHandler(403, 'This is a private stream for followers only'));
      }
    }

    res.status(200).json(stream);
  } catch (err) {
    console.error('Get stream error:', err);
    next(err);
  }
};

// Get live streams
export const getLiveStreams = async (req, res, next) => {
  try {
    const streams = await Stream.find({ isLive: true })
      .populate('streamer', 'username profilePhoto')
      .populate('category', 'name')
      .sort({ viewers: -1 });

    res.status(200).json(streams);
  } catch (err) {
    console.error('Get live streams error:', err);
    next(err);
  }
};

// Get all streamers
export const getStreamers = async (req, res, next) => {
  try {
    const streamers = await User.find({ role: 'streamer' })
      .select('username displayName profilePhoto bannerImage bio followers following isLive currentStream');
    res.status(200).json(streamers);
  } catch (err) {
    console.error('Get streamers error:', err);
    next(err);
  }
};

// Follow a streamer
export const followStreamer = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(errorHandler(400, 'Invalid streamer ID'));
    }

    const streamer = await User.findById(req.params.id);
    if (!streamer || streamer.role !== 'streamer') {
      return next(errorHandler(404, 'Streamer not found'));
    }

    await User.findByIdAndUpdate(req.user.id, { $addToSet: { following: streamer._id } });
    await User.findByIdAndUpdate(streamer._id, { $addToSet: { followers: req.user.id } });

    res.status(200).json({ message: 'Followed successfully' });
  } catch (err) {
    console.error('Follow streamer error:', err);
    next(err);
  }
};

// Unfollow a streamer
export const unfollowStreamer = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(errorHandler(400, 'Invalid streamer ID'));
    }

    const streamer = await User.findById(req.params.id);
    if (!streamer || streamer.role !== 'streamer') {
      return next(errorHandler(404, 'Streamer not found'));
    }

    await User.findByIdAndUpdate(req.user.id, { $pull: { following: streamer._id } });
    await User.findByIdAndUpdate(streamer._id, { $pull: { followers: req.user.id } });

    res.status(200).json({ message: 'Unfollowed successfully' });
  } catch (err) {
    console.error('Unfollow streamer error:', err);
    next(err);
  }
};

// WebSocket handlers for stream
export const handleStreamWebSocket = (wss) => {
  const viewers = new Map();

  wss.on('connection', (ws, req) => {
    const urlParts = req.url.split('/');
    const streamId = urlParts.pop();
    const isViewer = urlParts.includes('view');

    console.log(`WebSocket connection for ${isViewer ? 'viewer' : 'broadcaster'} streamId:`, streamId);

    ws.on('message', async (message) => {
      console.log('WebSocket message received:', message.toString());
      try {
        const data = JSON.parse(message);
        if (data.type === 'AUTH') {
          if (!data.token) {
            console.log('No token provided for streamId:', streamId);
            ws.close(1008, 'No token provided');
            return;
          }
          console.log('Verifying token for streamId:', streamId);
          const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
          console.log('Token verified, userId:', decoded.id);
          ws.userId = decoded.id;

          if (isViewer) {
            if (!viewers.has(streamId)) {
              viewers.set(streamId, new Set());
            }
            viewers.get(streamId).add(decoded.id);

            const stream = await Stream.findById(streamId);
            if (!stream) {
              ws.close(1008, 'Stream not found');
              return;
            }

            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'VIEWER_COUNT', count: viewers.get(streamId).size }));
              }
            });
          } else {
            const stream = await Stream.findById(streamId);
            if (!stream || stream.streamer.toString() !== decoded.id) {
              ws.close(1008, 'Unauthorized broadcaster');
              return;
            }
            ws.isAuthenticated = true;
          }
        } else if (data.type === 'CHAT_MESSAGE' && ws.userId && isViewer) {
          const user = await User.findById(ws.userId).select('username');
          if (!user) {
            ws.close(1008, 'User not found');
            return;
          }
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client !== ws) {
              client.send(JSON.stringify({
                type: 'CHAT_MESSAGE',
                user: user.username,
                message: data.message,
                timestamp: new Date(),
              }));
            }
          });
        }
      } catch (err) {
        console.error('WebSocket message error for streamId:', streamId, err);
        ws.close(1008, 'Invalid message or authentication');
      }
    });

    ws.on('close', async (code, reason) => {
      console.log('WebSocket closed for streamId:', streamId, 'Code:', code, 'ReasonMinecraft:', reason.toString());
      if (isViewer && ws.userId && viewers.has(streamId)) {
        viewers.get(streamId).delete(ws.userId);
        if (viewers.get(streamId).size === 0) {
          viewers.delete(streamId);
        }
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'VIEWER_COUNT', count: viewers.get(streamId)?.size || 0 }));
          }
        });
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket error for streamId:', streamId, err);
    });
  });
};