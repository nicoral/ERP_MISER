import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly supabase: SupabaseClient;
  private readonly buckets = {
    public: 'myserpublic',
    private: 'myserprivate',
  };

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const serviceKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY'
    );

    if (!url || !serviceKey) {
      throw new Error(
        'Supabase credentials not found in environment variables.'
      );
    }

    this.supabase = createClient(url, serviceKey);
  }

  /**
   * Obtiene una URL firmada temporal para acceder a un archivo privado
   */
  async getPrivateFileUrl(
    path: string,
    expiresInSeconds = 3600
  ): Promise<{ url: string; type: 'signed' }> {
    const bucket = this.buckets.private;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      this.logger.error(`Error al generar URL firmada ${error?.message}`);
      return { url: '', type: 'signed' };
    }

    return { url: data.signedUrl, type: 'signed' };
  }

  /**
   * Sube un archivo al bucket especificado (público o privado)
   * y devuelve una URL pública o firmada.
   */
  async uploadFile(
    path: string,
    fileBuffer: Buffer,
    contentType: string,
    isPublic: boolean = true
  ): Promise<{ url: string; type: 'public' | 'signed'; path: string }> {
    const bucket = isPublic ? this.buckets.public : this.buckets.private;

    const { error: uploadError } = await this.supabase.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      throw new InternalServerErrorException(
        `Error al subir archivo: ${uploadError.message}`
      );
    }

    if (isPublic) {
      const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
      return { url: data.publicUrl, type: 'public', path };
    } else {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 15); // 15 minutes
      if (error || !data?.signedUrl) {
        throw new InternalServerErrorException(`Error al generar URL firmada`);
      }
      return { url: data.signedUrl, type: 'signed', path };
    }
  }

  /**
   * Elimina un archivo de un bucket (público o privado)
   */
  async removeFile(path: string, isPublic: boolean = true): Promise<void> {
    const bucket = isPublic ? this.buckets.public : this.buckets.private;

    const { error } = await this.supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new InternalServerErrorException(
        `Error al eliminar archivo: ${error.message}`
      );
    }
  }

  /**
   * Elimina un archivo de un bucket público
   */
  async removeFileByUrl(url: string, isPublic: boolean = true): Promise<void> {
    const bucket = isPublic ? this.buckets.public : this.buckets.private;
    const path = url.split(`${bucket}/`).pop();
    if (!path) {
      throw new InternalServerErrorException(
        `Error al obtener el path del archivo`
      );
    }

    const { error } = await this.supabase.storage.from(bucket).remove([path]);

    if (error) {
      throw new InternalServerErrorException(
        `Error al eliminar archivo: ${error.message}`
      );
    }
  }
}
