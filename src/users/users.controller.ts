import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Public, ResponseMessage, User } from "src/auth/decorator/customize";
import { IUser } from "./users.interface";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('users')
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ResponseMessage("Create a new user")
  async createRaw(
    @Body() createUserDto: CreateUserDto, @User() user: IUser
  ) {
    const newUser = await this.usersService.createRaw(createUserDto, user);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    }
  }

  @Get()
  @ResponseMessage("Fetch user with paginate")
  findAll(@Query('current') currentPage: string, @Query('pageSize') limit: string, @Query() qs: string ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @ResponseMessage("Fetch a user by id")
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);

  }

  @Patch()
  @ResponseMessage("Update a user")
  update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    return this.usersService.update(updateUserDto, user);
  }

  @Delete(":id")
  @ResponseMessage("Delete a user")
  remove(@Param("id") id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }
}
