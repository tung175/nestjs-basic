import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import { SoftDeleteModel } from "soft-delete-plugin-mongoose";
import {
  Permission,
  PermissionDocument,
} from "src/permissions/Schemas/permission.schema";
import { Role, RoleDocument } from "src/roles/Schemas/role.schema";
import { User, UserDocument } from "src/users/schemas/user.schema";
import { UsersService } from "src/users/users.service";
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from "./sample";

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);

  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    private configService: ConfigService,
    @InjectModel(Permission.name)
    private PermissionModel: SoftDeleteModel<PermissionDocument>,
    @InjectModel(Role.name) private RoleModel: SoftDeleteModel<RoleDocument>,
    private usersService: UsersService
  ) {}
  async onModuleInit() {
    const isInit = this.configService.get<string>("SHOULD_INIT");
    if (Boolean(isInit)) {
      const countUser = await this.userModel.count({});
      const countPermission = await this.PermissionModel.count({});
      const countRole = await this.RoleModel.count({});

      //create permissions

      if (countPermission === 0) {
        //bulk create
        await this.PermissionModel.insertMany(INIT_PERMISSIONS);
      }

      if (countRole === 0) {
        const permissions = await this.PermissionModel.find({}).select("_id");
        await this.RoleModel.insertMany([
          {
            name: ADMIN_ROLE,
            description: "Admin",
            isActive: true,
            permissions: permissions,
          },
          {
            name: USER_ROLE,
            description: "Người dùng/Ứng viên sử dụng hệ thống",
            isActive: true,
            permissions: [], //add role not permission
          },
        ]);
      }

      if (countUser === 0) {
        const adminRole = await this.RoleModel.findOne({ name: ADMIN_ROLE });
        const userRole = await this.RoleModel.findOne({ name: USER_ROLE });
        await this.userModel.insertMany([
          {
            name: "Admin",
            email: "admin@gmail.com",
            password: this.usersService.getHashPassword(
              this.configService.get<string>("INIT_PASSWORD")
            ),
            age: 100,
            gender: "MALE",
            address: "Viet Nam",
            role: adminRole?._id,
          },
          {
            name: "Duong",
            email: "Duongkq3@gmail.com",
            password: this.usersService.getHashPassword(
              this.configService.get<string>("INIT_PASSWORD")
            ),
            age: 100,
            gender: "MALE",
            address: "Viet Nam",
            role: adminRole?._id,
          },
          {
            name: "User",
            email: "User@gmail.com",
            password: this.usersService.getHashPassword(
              this.configService.get<string>("INIT_PASSWORD")
            ),
            age: 50,
            gender: "MALE",
            address: "Viet Nam",
            role: userRole?._id,
          },
        ]);
      }

      if (countUser > 0 && countRole > 0 && countPermission > 0) {
        this.logger.log("ALREADY INTI SAMPLE DATA...");
      }
    }
  }
}
