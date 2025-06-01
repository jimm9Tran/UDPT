// src/middleware/upload.ts

import multer from 'multer';
import { BadRequestError } from '@jimm9tran/common';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only image files are allowed'), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 4, // Maximum 4 files
  },
});

// Middleware for handling multiple image uploads
export const uploadImages = upload.array('images', 4);

// Conditional middleware that only applies multer for multipart/form-data
export const conditionalUploadImages = (req: any, res: any, next: any) => {
  // Check if the request is multipart/form-data
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    // Apply multer middleware for multipart requests
    uploadImages(req, res, next);
  } else {
    // Skip multer for JSON requests - set empty files array
    req.files = [];
    next();
  }
};

// Middleware for handling single image upload
export const uploadSingleImage = upload.single('image');

// Error handling middleware for multer errors
export const handleUploadError = (error: any, req: any, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      throw new BadRequestError('File size too large. Maximum 5MB per file.');
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      throw new BadRequestError('Too many files. Maximum 4 images allowed.');
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      throw new BadRequestError('Unexpected field name for file upload.');
    }
  }
  
  if (error.message === 'Only image files are allowed') {
    throw new BadRequestError(error.message);
  }
  
  next(error);
};
