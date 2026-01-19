/**
 * Storage Service - Supabase Storage Implementation
 * v2.0.0 - Connected to Supabase Buckets
 * 
 * Uploads files to Supabase Storage and returns public URLs.
 */

import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

export const storageService = {
  /**
   * Upload an avatar or logo to Supabase Storage
   */
  async uploadImage(file: File, bucket: 'avatars' | 'logos'): Promise<string> {
    console.log(`[Storage] Processing image for ${bucket}:`, file.name);
    
    try {
      // 1. Compress image if it's large or not a JPEG
      let uploadData: Blob | File = file;
      
      // Only compress if size > 100KB or if it's a PNG/other format or too large
      if (file.size > 100 * 1024 || !file.type.includes('jpeg')) {
        const dimensions = bucket === 'avatars' ? 400 : 800; // Increased logo dimensions slightly
        uploadData = await compressImageToBlob(file, dimensions, dimensions, 0.7);
      }
      
      // 2. Generate unique filename
      const fileExt = 'jpg';
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log(`[Storage] Uploading to Supabase ${bucket}...`);
      
      // 3. Upload to Supabase with retry logic
      const uploadWithRetry = async (retries = 2): Promise<any> => {
        try {
          const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, uploadData, {
              cacheControl: '3600',
              upsert: false,
              contentType: 'image/jpeg'
            });
          if (error) throw error;
          return data;
        } catch (err) {
          if (retries > 0) {
            console.warn(`[Storage] Upload failed, retrying... (${retries} left)`);
            await new Promise(r => setTimeout(r, 1000));
            return uploadWithRetry(retries - 1);
          }
          throw err;
        }
      };

      await uploadWithRetry();

      // 4. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      console.log(`[Storage] Upload complete: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      console.error('[Storage] Upload failed:', error);
      throw error;
    }
  },

  /**
   * Upload a document to Supabase Storage
   */
  async uploadDocument(file: File): Promise<string> {
    console.log('[Storage] Uploading document:', file.name);
    
    if (file.size > 10 * 1024 * 1024) { 
      throw new Error('File too large. Max 10MB.');
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const uploadWithRetry = async (retries = 2): Promise<any> => {
        try {
          const { data, error } = await supabase.storage
            .from('documents')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false,
              contentType: file.type || 'application/octet-stream'
            });
          if (error) throw error;
          return data;
        } catch (err) {
          if (retries > 0) {
            console.warn(`[Storage] Document upload failed, retrying... (${retries} left)`);
            await new Promise(r => setTimeout(r, 1000));
            return uploadWithRetry(retries - 1);
          }
          throw err;
        }
      };

      await uploadWithRetry();

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('[Storage] Document upload failed:', error);
      throw error;
    }
  }
};

/**
 * Compresses an image and returns a Blob
 */
function compressImageToBlob(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.src = url;
        img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d', { alpha: false });
            if (ctx) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
            }
            
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Compression failed'));
            }, 'image/jpeg', quality);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Image load error'));
        };
    });
}

