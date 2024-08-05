import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import aqp from 'api-query-params';
import { isEmpty } from 'class-validator';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Role, RoleDocument } from './Schemas/role.schema';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { IUser } from 'src/users/users.interface';
import { ConfigService } from '@nestjs/config';
import { ADMIN_ROLE } from 'src/databases/sample';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private RoleModel: SoftDeleteModel<RoleDocument>,
    private configService: ConfigService
  ) {}
  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const {name} = createRoleDto
    const isExist = await this.RoleModel.findOne({name})
    if (isExist) {
      throw new BadRequestException(`Tên ${name} đã tồn tại`)
    }
    const roles = await this.RoleModel.create({
      ...createRoleDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: roles?._id,
      createdAt: roles?.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, projection, population } = aqp(qs);
    delete filter.current
    delete filter.pageSize
    let { sort }: any = aqp(qs);
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.RoleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    if (isEmpty(sort)) {
      sort = "-updatedAt";
    }
    const result = await this.RoleModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select(projection as any)
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
      throw new BadRequestException("Not found Roles") ;
    }
    return await (await (this.RoleModel.findById(id))).populate({ path: 'permissions', select: { _id: 1, apiPath: 1, name: 1, method: 1 , module: 1} })
  }

  async update(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Not found Roles") ;
    }
    // const {name} = updateRoleDto
    // const isExist = await this.RoleModel.findOne({name})
    // if (isExist) {
    //   throw new BadRequestException(`Tên ${name} đã tồn tại`)
    // }
    return await this.RoleModel.updateOne(
      { _id: id },
      {
        ...updateRoleDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      }
    );
  }

  async remove(id: string, user: IUser) {
    const foundRole = await this.RoleModel.findById(id)
    if (foundRole.name === ADMIN_ROLE) {
      throw new BadRequestException("Không được xoá role Admin")
    }
    await this.RoleModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      }
    );
    return this.RoleModel.softDelete({
      _id: id,
    });
  }
}
