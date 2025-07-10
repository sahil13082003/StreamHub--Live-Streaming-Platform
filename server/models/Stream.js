import mongoose from 'mongoose';

const StreamSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  streamer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  isLive: { type: Boolean, default: true },
  viewers: { type: Number, default: 0 },
  thumbnail: { type: String },
  category: { type: String, enum: ["gaming", "music", "education", "talk"] },
  chatMessages: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    message: { type: String },
    timestamp: { type: Date, default: Date.now }
  }]
});

export default mongoose.model('Stream', StreamSchema);