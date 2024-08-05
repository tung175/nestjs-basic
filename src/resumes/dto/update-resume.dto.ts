import { PartialType } from "@nestjs/mapped-types";
import { CreateResumeDto } from "./create-resume.dto";
import {
  IsArray,
  IsDate,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import mongoose, { Types } from "mongoose";
class updatedBy {
  @IsNotEmpty({ message: "Id không được để trống" })
  // @IsMongoId()
  _id: Types.ObjectId;

  @IsNotEmpty({ message: "Email không được để trống" })
  @IsEmail()
  email: string;
}
class history {
  @IsNotEmpty({ message: "trạng thái không được để trống" })
  status: string;

  @IsNotEmpty({ message: "Ngày không được để trống" })
  // @IsDate()
  updatedAt: Date;

  @IsNotEmpty({ message: "Ngày cập nhật bởi không được để trống" })
  // @IsNotEmptyObject()
  // @IsObject({ message: "Ngày cập nhật phải là obj" })
  @ValidateNested()
  @Type(() => updatedBy)
  updatedBy: updatedBy;
}

export class UpdateResumeDto extends PartialType(CreateResumeDto) {
  @IsNotEmpty({ message: "Lịch sử không được để trống" })
  @IsArray({ message: "lịch sử phải là mảng" })
  @ValidateNested({ each: true })
  @Type(() => history)
  history: history[];
}
