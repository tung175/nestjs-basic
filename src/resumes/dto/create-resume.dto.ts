import { Transform, Type } from "class-transformer";
import { IsArray, IsDate, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from "class-validator";
import mongoose from "mongoose";

export class CreateResumeDto {
  @IsNotEmpty({ message: "Email không được để trống" })
  email: string;

  @IsNotEmpty({ message: "UserId không được để trống" })
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: "Url không được để trống" })
  url: string;

  @IsNotEmpty({ message: "Trạng thái được để trống" })
  status: string;

  @IsNotEmpty({ message: "Số lượng không được để trống" })
  companyId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty({ message: "Công việc không được để trống" })
  jobId: mongoose.Schema.Types.ObjectId;
}


export class CreateUserCvDto {
  @IsNotEmpty({message: "Url không được để trống"})
  url: string;

  @IsNotEmpty({message: "CompanyId không được để trống"})
  @IsMongoId()
  companyId: mongoose.Schema.Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty({message: "JobId không được để trống"})
  jobId: mongoose.Schema.Types.ObjectId;
}