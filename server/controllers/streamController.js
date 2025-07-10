import Stream from '../models/Stream.js';

// @desc    Start a new stream
export const startStream = async (req, res) => {
  const { title, description, category } = req.body;
  const streamer = req.user.id;

  try {
    const stream = new Stream({
      title,
      description,
      streamer,
      category,
      isLive: true,
    });

    await stream.save();
    res.status(201).json(stream);
  } catch (err) {
    res.status(500).json({ error: 'Failed to start stream' });
  }
};

// @desc    End a stream
export const endStream = async (req, res) => {
  try {
    const stream = await Stream.findByIdAndUpdate(
      req.params.id,
      { isLive: false, endTime: Date.now() },
      { new: true }
    );
    res.json(stream);
  } catch (err) {
    res.status(500).json({ error: 'Failed to end stream' });
  }
};