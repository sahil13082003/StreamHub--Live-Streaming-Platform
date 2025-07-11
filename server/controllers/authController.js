import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1m' });

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
    const updates = {}
    
    // Text fields
    if (req.body.username) updates.username = req.body.username
    if (req.body.bio) updates.bio = req.body.bio
    if (req.body.location) updates.location = req.body.location
    if (req.body.website) updates.website = req.body.website

    // Handle file upload
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'profile-photos',
        width: 500,
        height: 500,
        crop: 'fill'
      })
      updates.profilePhoto = result.secure_url
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password')

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    })
  } catch (err) {
    console.error('Update profile error:', err)
    res.status(400).json({
      success: false,
      message: err.message || 'Error updating profile'
    })
  }
}