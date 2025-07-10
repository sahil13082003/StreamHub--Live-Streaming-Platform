import express from 'express';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/start', protect, (req, res) => {
  res.send('Stream started');
});

export default router;