import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { diskStorage } from 'multer';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('files')
export class FilesController {
  constructor(private filesService: FilesService) {}
  @Auth()
  @Post('upload')
  @UseInterceptors(
    // FileInterceptor intercepts - the request before it reaches the handler.
    // It parses the multipart/form-data body and extracts the field named 'file'.
    // The second argument is Multer options — here we configure diskStorage.
    FileInterceptor('file', {
      // diskStorage tells Multer to save the uploaded file to the local disk
      // (instead of keeping it in memory as a Buffer)
      storage: diskStorage({
        // destination: the folder where uploaded files will be saved.
        // './uploads' means a folder named 'uploads' in the project root.
        destination: './uploads',

        // req  → the incoming HTTP request
        // file → the uploaded file metadata (originalname, mimetype, etc.)
        // cb   → callback to tell Multer what filename to use
        //        cb(error, filename) — pass null as error if everything is fine
        filename: (req, file, cb) => {
          // Prefix the original filename with a timestamp to avoid name collisions.
          // e.g. "photo.png" becomes "1712345678901-photo.png"
          const uniqueName = Date.now() + '-' + file.originalname;
          cb(null, uniqueName); // null = no error, uniqueName = final filename
        },
      }),
    }),
  )
  // The actual route handler — runs after the interceptor has processed the file.
  async uploadFile(
    // @UploadedFile() extracts the file that Multer parsed and attaches it here.
    // 'file' will contain metadata like: originalname, mimetype, path, size, etc.
    @UploadedFile() file: Express.Multer.File,

    // @Body() extracts the non-file form fields from the multipart request body.
    // messageId is optional (?), uploaderId is required.
    @Body() body: { messageId?: string; uploaderId: string },
  ) {
    // Delegate the actual saving logic to FilesService.
    // Pass the file metadata and body fields so the service can store them (e.g. in DB).
    return this.filesService.saveFile(file, body);
  }
}
