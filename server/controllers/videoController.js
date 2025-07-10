import Video from '../models/Video.js';
import { uploadToS3 } from '../utils/s3Upload.js'; // Hypothetical S3 utility

export const uploadVideo = async (req, res) => {
  const { title, description, streamId } = req.body;
  const file = req.file; // Multer middleware needed

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const s3Url = await uploadToS3(file);
    const video = new Video({
      title,
      description,
      streamId,
      url: s3Url,
      uploader: req.user.id,
    });

    await video.save();
    res.status(201).json(video);
  } catch (err) {
    res.status(500).json({ error: 'Upload failed' });
  }
};