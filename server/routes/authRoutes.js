import express from 'express';
import { register, login, getMe, logout, updateProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/upload.js'
import imagekit from '../utils/imagekit.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.patch(
  '/profile',
  protect,
  upload.single('profilePhoto'), // Handle single file upload
  updateProfile
);

router.get('/imagekit', (req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    res.send(authenticationParameters);
  } catch (error) {
    console.error('ImageKit auth error:', error);
    res.status(500).send({ error: 'Failed to generate authentication parameters' });
  }
});

export default router;