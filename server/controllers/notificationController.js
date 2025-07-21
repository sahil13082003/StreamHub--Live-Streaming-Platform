// server/controllers/notificationController.js
import Notification from '../models/Notification.js'
import User from '../models/User.js'
import Video from '../models/Video.js'
import Stream from '../models/Stream.js'
import { errorHandler } from '../middlewares/errorMiddleware.js'

// Get user notifications
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('sender', 'username profilePhoto')
      .populate('video', 'title')
      .populate('stream', 'title')
    
    res.status(200).json(notifications)
  } catch (err) {
    next(err)
  }
}

// Mark notification as read
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    )
    
    if (!notification) {
      return next(errorHandler(404, 'Notification not found'))
    }

    res.status(200).json({ message: 'Notification marked as read' })
  } catch (err) {
    next(err)
  }
}

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { $set: { read: true } }
    )
    
    res.status(200).json({ message: 'All notifications marked as read' })
  } catch (err) {
    next(err)
  }
}

// Delete notification
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id)
    
    if (!notification) {
      return next(errorHandler(404, 'Notification not found'))
    }

    res.status(200).json({ message: 'Notification deleted' })
  } catch (err) {
    next(err)
  }
}

// WebSocket notification handler
export const handleWebSocketNotification = (wss) => {
  wss.on('connection', (ws, req) => {
    // Authenticate connection using JWT
    const token = req.url.split('token=')[1]
    
    if (!token) {
      return ws.close()
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return ws.close()
      }

      // Store user ID with connection
      ws.userId = decoded.id

      // Send initial unread count
      const count = await Notification.countDocuments({ 
        user: decoded.id, 
        read: false 
      })
      ws.send(JSON.stringify({ type: 'INITIAL_COUNT', count }))
    })

    ws.on('close', () => {
      // Clean up
    })
  })

  // Function to send notifications to specific users
  const sendNotification = (userId, notification) => {
    wss.clients.forEach(client => {
      if (client.userId === userId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ 
          type: 'NEW_NOTIFICATION', 
          notification 
        }))
      }
    })
  }

  return { sendNotification }
}