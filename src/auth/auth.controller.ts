import {
  Body,
  Controller,
  Post,
  Req,
  Get,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public, ResponseMessage, User } from "./decorator/customize";
import { LocalAuthGuard } from "./local-auth.guard";
import { RegisterUserDto, UserLoginDto } from "src/users/dto/create-user.dto";
import { Response, Request, response } from "express";
import { IUser } from "src/users/users.interface";
import { RolesService } from "src/roles/roles.service";
import { ThrottlerGuard } from "@nestjs/throttler";
import { ApiBody, ApiTags } from "@nestjs/swagger";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private rolesService: RolesService
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @ApiBody({ type: UserLoginDto, })
  @ResponseMessage("Login success")
  @Post("/login")
  handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @Public()
  @ResponseMessage("Register a new user")
  @Post("/register")
  async createForClient(@Body() registerDTO: RegisterUserDto) {
    return await this.authService.register(registerDTO);
  }

  @Get("/account")
  @ResponseMessage("Get user information")
  async handleGetAccount(@User() user: IUser) {
    const temp = (await this.rolesService.findOne(user.role._id)) as any;
    user.permissions = temp.permissions;
    return { user };
  }

  @Public()
  @Get("/refresh")
  @ResponseMessage("Get refresh token")
  handleGetRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refresh_token = request.cookies["Refresh_Token"];
    return this.authService.processNewToken(refresh_token, response);
  }

  @Post("/logout")
  @ResponseMessage("Logout User")
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser
  ) {
    return this.authService.logoutWithToken(response, user);
  }
}
