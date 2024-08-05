import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsDate,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from "class-validator";
import mongoose from "mongoose";

class company {
  @IsMongoId()
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  logo: string;
}

export class CreateJobDto {
  @IsNotEmpty({ message: "Tên không được để trống" })
  name: string;

  @IsArray({message: "Kĩ năng phải là chuỗi"})
  @IsNotEmpty({ message: "Kĩ năng không được để trống" })
  @IsString({each: true, message: "Kĩ năng phải là string"})
  skills: string[];

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => company)
  company: company

  @IsNotEmpty({ message: "Địa chỉ không được để trống" })
  location: string;

  @IsNotEmpty({ message: "Lương được để trống" })
  salary: number;

  @IsNotEmpty({ message: "Số lượng không được để trống" })
  quantity: number;

  @IsNotEmpty({ message: "Trình độ không được để trống" })
  level: string;

  @IsNotEmpty({ message: "Mô tả không được để trống" })
  description: string;

  @Transform(({ value }) => new Date(value))
  @IsDate({message: "Ngày bắt đầu phải là dạng Date"})
  @IsNotEmpty({ message: "Ngày bắt đầu không được để trống" })
  startDate: Date;

  @Transform(({ value }) => new Date(value))
  @IsDate({message: "Ngày kết thúc phải là dạng Date"})
  @IsNotEmpty({ message: "Ngày kết thúc không được để trống" })
  endDate: Date;

  isActive: boolean;
}
