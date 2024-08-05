import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsString,
  isEmail,
} from "class-validator";

export class CreateSubscriberDto {
  @IsNotEmpty({ message: "Tên không được để trống" })
  name: string;

  @IsArray({ message: "Kĩ năng phải là chuỗi" })
  @IsNotEmpty({ message: "Kĩ năng không được để trống" })
  @IsString({ each: true, message: "Kĩ năng phải là string" })
  skills: string[];

  @IsNotEmpty({ message: "Email không được để trống" })
  @IsEmail()
  email: string;
}
