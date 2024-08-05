import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
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
}

export class CreateUserDto {
  @IsEmail({}, { message: "Email không đúng định dạng, vui vòng nhập lại!" })
  @IsNotEmpty({ message: "Email không được để trống" })
  email: string;

  @IsNotEmpty({ message: "Mật khẩu không được để trống" })
  password: string;

  @IsNotEmpty({ message: "Tên không được để trống" })
  name: string;

  @IsNotEmpty({ message: "Tuổi không được để trống" })
  age: number;

  @IsNotEmpty({ message: "Giới tính không được để trống" })
  gender: number;

  @IsNotEmpty({ message: "Địa chỉ không được để trống" })
  address: string;

  @IsMongoId({ message: "role mongo id không đc deder trống" })
  @IsNotEmpty({ message: "Vai trò không được để trống" })
  role: mongoose.Schema.Types.ObjectId;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => company)
  company: company;
}

export class RegisterUserDto {
  @IsEmail({}, { message: "Email không đúng định dạng, vui vòng nhập lại!" })
  @IsNotEmpty({ message: "Email không được để trống" })
  email: string;

  @IsNotEmpty({ message: "Mật khẩu không được để trống" })
  password: string;

  @IsNotEmpty({ message: "Tên không được để trống" })
  name: string;

  @IsNotEmpty({ message: "Tuổi không được để trống" })
  age: number;

  @IsNotEmpty({ message: "Giới tính không được để trống" })
  gender: number;

  @IsNotEmpty({ message: "Địa chỉ không được để trống" })
  address: string;
}

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: "admin@gmail.com", description: "username" })
  readonly username: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "123456",
    description: "password",
  })
  readonly password: string;
}
