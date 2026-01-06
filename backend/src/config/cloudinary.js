import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Check env
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error('Missing Cloudinary environment variables!');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔹 File filter dùng chung
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép upload file ảnh'), false);
  }
};

// ================= AVATAR =================
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'uteshop/avatars',
    resource_type: 'image',
    public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  }),
});

// ================= BOOK =================
const bookStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'uteshop/books',
    resource_type: 'image',
    public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
  }),
});

// ================= EXPORT =================
export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
});

export const uploadBook = multer({
  storage: bookStorage,
  fileFilter: imageFileFilter,
});

export default cloudinary;
