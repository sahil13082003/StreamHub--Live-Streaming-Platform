import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cloudinary from '../utils/cloudinary.js';
import fs from 'fs';

// @desc    Register a new user
export const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user
    user = new User({ username, email, password, role });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Generate JWT
    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

export const logout = async (req, res) => {
  try {

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const updates = {
      username: req.body.username,
      bio: req.body.bio,
      location: req.body.location,
      website: req.body.website
    };

    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(
          `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
          {
            folder: 'profile-photos',
            resource_type: 'image',
            timeout: 60000,
            transformation: [
              { width: 500, height: 500, crop: 'fill' },
              { quality: 'auto:best' }
            ]
          }
        );
        console.log('Cloudinary upload result:', result);
        updates.profilePhoto = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', JSON.stringify(uploadError, null, 2));
        return res.status(400).json({
          success: false,
          message: `Cloudinary error: ${uploadError.message || 'Failed to upload image'}`,
          errorDetails: uploadError
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(400).json({
      success: false,
      message: err.message || 'Something went wrong!'
    });
  }
};