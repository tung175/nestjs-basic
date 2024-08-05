import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Permission, PermissionDocument } from './Schemas/permission.schema';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';
import mongoose from 'mongoose';

@Injectable()
export class PermissionsService {
  @InjectModel(Permission.name) private PermissionModel: SoftDeleteModel<PermissionDocument>;
  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const {apiPath, method} = createPermissionDto
    const isExist = await this.PermissionModel.findOne({apiPath, method})
    if (isExist) {
      throw new BadRequestException(`apiPath ${apiPath} và phương thức ${method} đã tồn tại`)
    }
    return await this.PermissionModel.create({
      ...createPermissionDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, projection, population } = aqp(qs);
    delete filter.current
    delete filter.pageSize
    let { sort }: any = aqp(qs);
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.PermissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    if (isEmpty(sort)) {
      sort = "-updatedAt";
    }
    const result = await this.PermissionModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };;
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "Not found Job";
    }
    return await this.PermissionModel.findOne({_id: id});;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, user) {
    return await this.PermissionModel.updateOne(
      { _id: id },
      {
        ...updatePermissionDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      }
    );
  }

  async remove(id: string, user: IUser) {
    await this.PermissionModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      }
    );
    return this.PermissionModel.softDelete({
      _id: id,
    });;
  }
}
