import { IsNotEmpty } from "class-validator";

export class CreatePermissionDto {
    @IsNotEmpty({message: "Tên không được bỏ trống"})
    name: string;
  
    @IsNotEmpty({message: "API không được bỏ trống"})
    apiPath: string;
  
    @IsNotEmpty({message: "Phương thức không được bỏ trống"})
    method: string;
  
    @IsNotEmpty({message: "Module không được bỏ trống"})
    module: string;
}
