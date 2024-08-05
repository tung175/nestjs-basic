import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
} from "class-validator";
import mongoose from "mongoose";

export class CreateRoleDto {
  @IsNotEmpty({ message: "Tên không được để trống" })
  name: string;

  @IsNotEmpty({ message: "Chú thích không được để trống" })
  description: string;

  @IsNotEmpty({ message: "isActive không được để trống" })
  @IsBoolean({ message: "isActive co gia tri boolean" })
  isActive: boolean;

  @IsNotEmpty({ message: "Quyền hạn không được để trống" })
  @IsArray({ message: "Quyền hạn phải là mảng" })
  @IsMongoId({each: true, message: "each permission la mong obj id"})
  permissions: mongoose.Schema.Types.ObjectId[];
}


