
import { FileUploadService } from './storage/fileUploadService';
import { UrlService } from './storage/urlService';

export class StorageService {
  static async uploadFile(file: File, path: string) {
    return FileUploadService.uploadFile(file, path);
  }

  static async deleteFile(path: string) {
    return FileUploadService.deleteFile(path);
  }

  static getPublicUrl(path: string): string {
    return UrlService.getPublicUrl(path);
  }

  static getPublicVideoUrl(videoUrl: string): string {
    return UrlService.getPublicVideoUrl(videoUrl);
  }

  static async fileExists(path: string): Promise<boolean> {
    return FileUploadService.fileExists(path);
  }
}
