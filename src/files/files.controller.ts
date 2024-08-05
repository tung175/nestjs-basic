import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  UseFilters,
} from "@nestjs/common";
import { FilesService } from "./files.service";
import { CreateFileDto } from "./dto/create-file.dto";
import { UpdateFileDto } from "./dto/update-file.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { Public, ResponseMessage } from "src/auth/decorator/customize";
import { ApiTags } from "@nestjs/swagger";
import { HttpExceptionFilter } from "src/core/http-exception.filter";

@ApiTags('files')
@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Public()
  @Post("upload")
  @ResponseMessage("Upload single file")
  @UseFilters(new HttpExceptionFilter())
  @UseInterceptors(FileInterceptor("fileUpload")) //tên field sử dụng trong form-data
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {fileName: file.filename}
  }
  @Post()
  create(@Body() createFileDto: CreateFileDto) {
    return this.filesService.create(createFileDto);
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.filesService.remove(+id);
  }
}
