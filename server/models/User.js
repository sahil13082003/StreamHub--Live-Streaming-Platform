import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["viewer", "streamer", "admin"], default: "viewer" },
  isLive: { type: Boolean, default: false },
  currentStream: { type: mongoose.Schema.Types.ObjectId, ref: 'Stream', default: null },
  profilePicture: {
    type: String,
    default: "https://ik.imagekit.io/bjoxlpi7q/streamhub/thumbnails/Profile.png?updatedAt=1753584352350"
  },
  // Profile Information
  profilePicture: {
    type: String,
    default: "https://ik.imagekit.io/bjoxlpi7q/streamhub/thumbnails/Profile.png?updatedAt=1753584352350"
  },
  bannerImage: {
    type: String,
    default: ""
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 50
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ""
  },
  location: {
    type: String,
    maxlength: 100,
    default: ""
  },
  website: {
    type: String,
    match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, 'Please use a valid URL'],
    default: ""
  },
  birthDate: {
    type: Date
  },
  gender: {
    type: String,
    enum: ["male", "female", "other", "prefer-not-to-say", ""],
    default: ""
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Auto-manage createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.model('User', UserSchema);