// server/models/Notification.js
import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['follow', 'like', 'live'],
    required: true
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  },
  stream: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stream'
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

notificationSchema.index({ user: 1, read: 1 })
notificationSchema.index({ createdAt: -1 })

const Notification = mongoose.model('Notification', notificationSchema)
export default Notification