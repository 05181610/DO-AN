import { Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as sharp from 'sharp';

@Injectable()
export class UploadService {
  private readonly uploadDir = './uploads';
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor() {
    // Tạo thư mục uploads nếu chưa tồn tại
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'images'): Promise<string> {
    try {
      if (!file) {
        throw new BadRequestException('Không tìm thấy file');
      }

      // Kiểm tra kích thước file
      if (file.size > this.maxFileSize) {
        throw new BadRequestException('File không được vượt quá 5MB');
      }

      // Kiểm tra định dạng file
      const ext = extname(file.originalname).toLowerCase();
      if (!this.allowedExtensions.includes(ext)) {
        throw new BadRequestException('Định dạng file không được hỗ trợ');
      }

      // Tạo tên file mới
      const fileName = `${uuidv4()}${ext}`;
      const uploadPath = `${this.uploadDir}/${folder}`;

      // Tạo thư mục nếu chưa tồn tại
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      // Tối ưu và lưu ảnh
      await sharp(file.buffer)
        .resize(1200, 1200, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toFile(`${uploadPath}/${fileName}`);

      // Trả về đường dẫn tương đối
      return `/${folder}/${fileName}`;
    } catch (error) {
      console.error('Upload file error:', error);
      throw new BadRequestException('Không thể tải file lên. Vui lòng thử lại.');
    }
  }

  async uploadMultipleFiles(files: Express.Multer.File[], folder: string = 'images'): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  deleteFile(filePath: string): void {
    try {
      const fullPath = `${this.uploadDir}${filePath}`;
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.error('Delete file error:', error);
    }
  }

  async replaceFile(oldPath: string, newFile: Express.Multer.File, folder: string = 'images'): Promise<string> {
    // Xóa file cũ
    this.deleteFile(oldPath);
    // Upload file mới
    return this.uploadFile(newFile, folder);
  }
}