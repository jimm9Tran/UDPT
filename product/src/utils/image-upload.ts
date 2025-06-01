// src/utils/image-upload.ts

import { cloudinary } from '../config/cloudinary';
import { BadRequestError } from '@jimm9tran/common';

interface UploadResult {
  public_id: string;
  secure_url: string;
}

export class ImageUploadUtil {
  /**
   * Upload a single image to Cloudinary
   */
  static async uploadImage(
    imageBuffer: Buffer,
    folder: string = 'products'
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          quality: 'auto',
          fetch_format: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(new BadRequestError('Image upload failed'));
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
            });
          } else {
            reject(new BadRequestError('Image upload failed'));
          }
        }
      ).end(imageBuffer);
    });
  }

  /**
   * Upload multiple images to Cloudinary
   */
  static async uploadMultipleImages(
    imageBuffers: Buffer[],
    folder: string = 'products'
  ): Promise<UploadResult[]> {
    const uploadPromises = imageBuffers.map(buffer => 
      this.uploadImage(buffer, folder)
    );
    
    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Failed to delete image:', error);
      // Don't throw error here as it's not critical
    }
  }

  /**
   * Delete multiple images from Cloudinary
   */
  static async deleteMultipleImages(publicIds: string[]): Promise<void> {
    const deletePromises = publicIds.map(publicId => 
      this.deleteImage(publicId)
    );
    
    await Promise.allSettled(deletePromises);
  }

  /**
   * Extract public_id from Cloudinary URL
   */
  static extractPublicId(url: string): string | null {
    try {
      const parts = url.split('/');
      const versionIndex = parts.findIndex(part => part.startsWith('v'));
      
      if (versionIndex === -1) return null;
      
      const pathAfterVersion = parts.slice(versionIndex + 1).join('/');
      const publicId = pathAfterVersion.split('.')[0];
      
      return publicId;
    } catch (error) {
      return null;
    }
  }
}
