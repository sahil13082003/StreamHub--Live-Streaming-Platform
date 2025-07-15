// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';    

// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   const filetypes = /jpeg|jpg|png|gif/;
//   const mimetype = filetypes.test(file.mimetype);
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   if (mimetype && extname) {
//     return cb(null, true);
//   }
//   cb(new Error('Only image files are allowed!'));
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }
// });

// export default upload;

import multer from 'multer'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import imagekit from '../utils/imagekit.js'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|mp4|mov|avi|mkv/ 
  const mimetype = filetypes.test(file.mimetype)
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

  if (mimetype && extname) {
    return cb(null, true)
  }
  cb(new Error('Error: File upload only supports the following filetypes - ' + filetypes))
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
})

export const uploadMiddleware = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 }
])

export const uploadToImageKit = async (file, folder, fileName) => {
  try {
    const response = await imagekit.upload({
      file: file.buffer,
      fileName: fileName || file.originalname,
      folder: folder,
      useUniqueFileName: true
    })
    return response
  } catch (error) {
    console.error('ImageKit upload error:', error)
    throw error
  }
}
export default upload