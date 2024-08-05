import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateUserDto, RegisterUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User as UserM, UserDocument } from "./schemas/user.schema";
import mongoose, { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { genSaltSync, hashSync, compareSync } from "bcryptjs";
import { SoftDeleteModel } from "soft-delete-plugin-mongoose";
import { IUser } from "./users.interface";
import aqp from "api-query-params";
import { isEmpty } from "class-validator";
import { ConfigService } from "@nestjs/config";
import { Role, RoleDocument } from "src/roles/Schemas/role.schema";
import { ACCOUNT_ADMIN, USER_ROLE } from "src/databases/sample";
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserM.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,
    private configService: ConfigService
  ) {}

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  };

  isValidPassword(pass: string, hash: string) {
    return compareSync(pass, hash);
  }

  async create(createUserDto: CreateUserDto) {
    // async create(email: string, password: string, name: string) {
    const hashPassword = this.getHashPassword(createUserDto.password);
    const user = await this.userModel.create({
      email: createUserDto.email,
      password: hashPassword,
      name: createUserDto.name,
    });
    return user;
  }

  async createRaw(createUserDto: CreateUserDto, user: IUser) {
    // async create(email: string, password: string, name: string) {
    const isExist = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (isExist) {
      throw new BadRequestException(
        `Email: ${createUserDto.email} Đã tồn tại trên hệ thống vui lòng sử dụng email khác`
      );
    }
    
    const hashPassword = this.getHashPassword(createUserDto.password);
    const userRaw = await this.userModel.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashPassword,
      age: createUserDto.age,
      gender: createUserDto.gender,
      address: createUserDto.address,
      role: createUserDto.role,
      company: createUserDto.company,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return userRaw;
  }

  async register(registerDTO: RegisterUserDto) {
    const isExist = await this.userModel.findOne({ email: registerDTO.email });
    if (isExist) {
      throw new BadRequestException(
        `Email: ${registerDTO.email} Đã tồn tại trên hệ thống vui lòng sử dụng email khác`
      );
    }
    const userRole = await this.roleModel.findOne({name: USER_ROLE})
    const hashPassword = this.getHashPassword(registerDTO.password);
    const register = await this.userModel.create({
      name: registerDTO.name,
      email: registerDTO.email,
      password: hashPassword,
      age: registerDTO.age,
      gender: registerDTO.gender,
      address: registerDTO.address,
      role: userRole?._id,
    });
    return register;
  }
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, projection, population } = aqp(qs);
    delete filter.current
    delete filter.pageSize
    let { sort }: any = aqp(qs);
    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;
    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    if (isEmpty(sort)) {
      sort = "-updatedAt";
    }
    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select("-password")
      .exec();
    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "Not found user";
    }
    return this.userModel.findOne({
      _id: id,
    }).select("-password").populate({ path: "role", select: {name: 1, _id: 1}});
  }

  findOneByUsername(username: string) {
    return this.userModel.findOne({
      email: username,
    }).populate({ path: "role", select: {name: 1}});
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      }
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return "Not found user";
    }
    const foundRole = await this.userModel.findById(id)
    if (foundRole && foundRole.name === ACCOUNT_ADMIN) {
      throw new BadRequestException("Không được xoá Tài khoản Admin")
    }
    // return this.userModel.deleteOne({
    //   _id: id
    // });
    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      }
    );
    return this.userModel.softDelete({
      _id: id,
    });
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({_id}, {refreshToken})
  }

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({refreshToken}).populate({ path: "role", select: {name: 1}})
  }
}
