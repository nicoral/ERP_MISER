import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from '../types/cloudinary-response';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'miser'
  ): Promise<CloudinaryResponse> {
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `mixer/${folder}`,
            transformation: [
              { width: 500, crop: 'scale' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (error, uploadResult) => {
            if (error) return reject(error);
            if (!uploadResult)
              return reject(new Error('Upload failed: No result returned'));
            return resolve(uploadResult);
          }
        )
        .end(file.buffer);
    });

    return uploadResult as CloudinaryResponse;
  }
}
