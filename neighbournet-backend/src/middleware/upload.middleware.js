const multer = require('multer');
const cloudinaryStorage = require('multer-storage-cloudinary'); 
const cloudinary = require('../config/cloudinary'); 

const storage = cloudinaryStorage({
  cloudinary: cloudinary, 
  folder: 'neighbournet/posts',
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;