import { Module } from "@nestjs/common";
import { DatabasesService } from "./databases.service";
import { DatabasesController } from "./databases.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/users/schemas/user.schema";
import {
  Permission,
  PermissionSchema,
} from "src/permissions/Schemas/permission.schema";
import { Role, RoleSchema } from "src/roles/Schemas/role.schema";
import { UsersService } from "src/users/users.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  controllers: [DatabasesController],
  providers: [DatabasesService, UsersService],
  exports: [DatabasesService],
})
export class DatabasesModule {}
