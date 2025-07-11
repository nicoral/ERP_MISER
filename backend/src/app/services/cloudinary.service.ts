import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from '../types/cloudinary-response';

@Injectable()
export class CloudinaryService {
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'miser',
    withTransformation: boolean = true
  ): Promise<CloudinaryResponse> {
    const isPDF = file.mimetype === 'application/pdf';

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `mixer/${folder}`,
            resource_type: 'auto',
            transformation:
              withTransformation && !isPDF
                ? [
                    { width: 500, crop: 'scale' },
                    { quality: 'auto', fetch_format: 'auto' },
                  ]
                : [],
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

  async deleteFile(urlFile: string) {
    const urlParts = urlFile.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');

    if (uploadIndex === -1 || uploadIndex + 2 >= urlParts.length) {
      throw new Error('Invalid Cloudinary URL format');
    }

    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    const publicId = pathAfterUpload.split('.')[0];

    await cloudinary.uploader.destroy(publicId);
  }
}
