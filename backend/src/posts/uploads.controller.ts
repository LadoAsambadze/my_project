import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { MediaType } from '@prisma/client';

// Multer (bundled with @nestjs/platform-express) buffers the file in memory by
// default; we only need this subset of its shape.
interface UploadedFileLike {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

/**
 * Accepts a single image/video upload (multipart field `file`) from a
 * signed-in user, stores it under /uploads, and returns the public URL plus the
 * detected media type. The frontend then attaches that to a createPost call.
 */
@Controller('uploads')
export class UploadsController {
  @Post()
  @UseGuards(AuthGuard('jwt-access'))
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE } }),
  )
  async upload(
    @UploadedFile() file: UploadedFileLike | undefined,
    @Req() req: Request,
  ): Promise<{ url: string; type: MediaType }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const type = mediaTypeFor(file.mimetype);
    if (!type) {
      throw new BadRequestException('Only image and video files are allowed');
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${randomUUID()}${extname(file.originalname).toLowerCase()}`;
    await writeFile(join(UPLOAD_DIR, name), file.buffer);

    const base =
      process.env.PUBLIC_BACKEND_URL ?? `${req.protocol}://${req.get('host')}`;
    return { url: `${base}/uploads/${name}`, type };
  }
}

function mediaTypeFor(mimetype: string): MediaType | null {
  if (mimetype.startsWith('image/')) return MediaType.IMAGE;
  if (mimetype.startsWith('video/')) return MediaType.VIDEO;
  return null;
}
