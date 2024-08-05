import { BadRequestException, Injectable } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { JwtService } from "@nestjs/jwt";
import { IUser } from "src/users/users.interface";
import { RegisterUserDto } from "src/users/dto/create-user.dto";
import { ConfigService } from "@nestjs/config";
import ms from "ms";
import { Response } from "express";
import { RolesService } from "src/roles/roles.service";
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rolesService: RolesService
  ) {}
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password);
      if (isValid === true) {
        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.rolesService.findOne(userRole._id);

        const objUser = {
          ...user.toObject(),
          permissions: temp?.permissions ?? [],
        };
        return objUser;
      }
    }
    return null;
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role, permissions } = user;
    const payload = {
      sub: "token login",
      iss: "from server",
      _id,
      name,
      email,
      role,
    };

    //update user with refresh token
    const refresh_token = this.createRefreshToken(payload);

    //set cookie
    response.cookie("Refresh_Token", refresh_token, {
      maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRES")),
      httpOnly: true,
    });
    await this.usersService.updateUserToken(refresh_token, _id);

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
        permissions,
      },
    };
  }

  async register(registerDTO: RegisterUserDto) {
    const newUser = await this.usersService.register(registerDTO);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt,
    };
  }

  createRefreshToken = (payload: any) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
      expiresIn:
        ms(this.configService.get<string>("JWT_REFRESH_EXPIRES")) / 1000,
    });
    return refresh_token;
  };

  processNewToken = async (refreshToken: string, response: Response) => {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
      });
      const user = await this.usersService.findUserByToken(refreshToken);
      if (user) {
        // update refresh token
        const { _id, name, email, role } = user;
        const payload = {
          sub: "Refresh Token",
          iss: "from server",
          _id,
          name,
          email,
          role,
        };

        //update user with refresh token
        const refresh_token = this.createRefreshToken(payload);

        await this.usersService.updateUserToken(refresh_token, _id.toString());

        const userRole = user.role as unknown as { _id: string; name: string };
        const temp = await this.rolesService.findOne(userRole._id);

        // set refresh token as cookies
        response.clearCookie("Refresh_Token");

        //set cookie
        response.cookie("Refresh_Token", refresh_token, {
          maxAge: ms(this.configService.get<string>("JWT_REFRESH_EXPIRES")),
          httpOnly: true,
        });

        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            role,
            permissions: temp?.permissions ?? [],
          },
        };
      } else {
        throw new BadRequestException("Không tìm thấy người dùng");
      }
    } catch (error) {
      throw new BadRequestException("Refresh Token không hợp lệ");
    }
  };

  logoutWithToken = async (response: Response, user: IUser) => {
    await this.usersService.updateUserToken("", user._id);
    response.clearCookie("Refresh_Token");
    return "ok";
  };
}
