/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Request } from 'express';
import multer from 'multer';
import fs from 'fs'; // Import the fs module

export const uploadFile = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let uploadPath = '';

      if (
        file.fieldname === 'cover_image' ||
        file.fieldname === 'profile_image'
      ) {
        uploadPath = 'uploads/images/profile';
      } else if (file.fieldname === 'product_img') {
        uploadPath = 'uploads/images/products';
      } else if (file.fieldname === 'image') {
        uploadPath = 'uploads/images/image';
      } else if (file.fieldname === 'message_img') {
        uploadPath = 'uploads/images/message';
      } else if (file.fieldname === 'video') {
        uploadPath = 'uploads/video';
      } else if (file.fieldname === 'audio') {
        uploadPath = 'uploads/audio';
      } else if (file.fieldname === 'document') {
        uploadPath = 'uploads/documents';
      } else if (file.fieldname === 'files') {
        uploadPath = 'uploads/images/banner';
      } else {
        uploadPath = 'uploads/others';
      }


      // Ensure the directory exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },

    filename: function (req, file, cb) {
      // Remove problematic characters from the original filename
      const sanitizedFilename = file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
      const name = Date.now() + '-' + sanitizedFilename;
      cb(null, name);
    },
  });

  const fileFilter = (req: Request, file: any, cb: any) => {
    const allowedMimetypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'image/tiff',
      'image/bmp',
      'video/mp4',
      'audio/mpeg',
      'audio/wav',
    ];

    const allowedFieldnames = [
      'image',
      'profile_image',
      'cover_image',
      'product_img',
      'video',
      'thumbnail',
      'video_thumbnail',
      'message_img',
      'audio',
      'document',
      'files'
    ];

    if (file.fieldname === undefined) {
      cb(null, true);
    } else if (allowedFieldnames.includes(file.fieldname)) {
      if (allowedMimetypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Allowed types are ${allowedMimetypes.join(', ')}.`));
      }
    } else {
      cb(new Error(`Invalid fieldname: ${file.fieldname}. Allowed fieldnames are ${allowedFieldnames.join(', ')}.`));
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
  }).fields([
    { name: 'image', maxCount: 30 },
    { name: 'product_img', maxCount: 10 },
    { name: 'cover_image', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 },
    { name: 'video', maxCount: 5 },
    { name: 'audio', maxCount: 5 },
    { name: 'document', maxCount: 10 },
    { name: 'video_thumbnail', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
    { name: 'message_img', maxCount: 10 },
    { name: 'files', maxCount: 10 },

  ]);

  return upload;
};
