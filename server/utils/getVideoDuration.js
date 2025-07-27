import { getVideoDurationInSeconds } from 'get-video-duration';
import path from 'path';

export const getVideoDuration = async (filePath) => {
  try {
    const duration = await getVideoDurationInSeconds(filePath);
    return duration;
  } catch (error) {
    console.error('Error getting video duration:', error);
    throw new Error('Could not get video duration');
  }
};
