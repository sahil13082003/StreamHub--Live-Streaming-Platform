// server/models/Stream.js
import mongoose from 'mongoose'

const streamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ""
  },
  streamer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  isLive: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  viewers: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  streamKey: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
})

streamSchema.index({ streamer: 1 })
streamSchema.index({ isLive: 1 })
streamSchema.index({ category: 1 })

const Stream = mongoose.model('Stream', streamSchema)
export default Stream