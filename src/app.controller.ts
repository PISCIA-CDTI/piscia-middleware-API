import { Controller, Post, UseGuards, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReqUser } from './utils/requser.decorator';
import { AuthService } from './auth/auth.service';
import { User } from './users/user';
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";

@ApiTags('App')
@Controller()
export class AppController {

    constructor(private readonly authService: AuthService) {}

    @ApiOperation({ summary: 'Log in into the platform' })
    @ApiResponse({
        status: 200,
        description: 'Log in into the platform'})
    @UseGuards(AuthGuard('local'))
    @Post('auth/login')
    async login(@ReqUser() user: User) {
        return this.authService.login(user);
    }

    @ApiOperation({ summary: 'Get a user profile' })
    @ApiResponse({
        status: 200,
        description: 'Get a user profile'})
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@ReqUser() user: User) {
        return user;
    }
}
