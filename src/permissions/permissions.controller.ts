import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ResponseMessage, User } from 'src/auth/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @ResponseMessage("Create a permission")
  async create(@Body() createPermissionDto: CreatePermissionDto, @User() user: IUser) {
    const permission = await this.permissionsService.create(createPermissionDto, user);
    return {
      _id: permission?._id,
      createdAt: permission?.createdAt
    }
  }

  @Get()
  @ResponseMessage("Fetch permission with paginate")
  async findAll(@Query("current") currentPage: string, @Query("pageSize") limit: number,@Query() qs: string) {
    return await this.permissionsService.findAll(+currentPage, +limit, qs);
  }

  @ResponseMessage("Get a permission by id")
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.permissionsService.findOne(id);
  }

  @ResponseMessage("Update a permission")
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto, @User() user:IUser) {
    return await this.permissionsService.update(id, updatePermissionDto, user);
  }

  @ResponseMessage("Delete a permission")
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.permissionsService.remove(id, user);
  }
}
