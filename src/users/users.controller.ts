import { Body, Controller, Param, Delete, Get, Post, Put, UseGuards, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user';
import { UsersService } from './users.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ReqUser } from '../utils/requser.decorator';
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";

@ApiTags('User')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({ summary: 'Get all Users from the system' })
    @ApiResponse({
        status: 200,
        description: 'Get all Users from the system',
        type: [User]})
    @ApiBearerAuth()
    @Get()
    @UseGuards(RolesGuard)
    @Roles('admin')
    findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @ApiOperation({ summary: 'Get a Users from the system' })
    @ApiResponse({
        status: 200,
        description: 'Get a Users from the system',
        type: User})
    @ApiBearerAuth()
    @Get(':id')
    @UseGuards(AuthGuard('jwt'))
    findOne(@Param('id') id: string): Promise<User> {
        return this.usersService.findOne(id);
    }

    @ApiOperation({ summary: 'Create a Users into the system' })
    @ApiResponse({
        status: 200,
        description: 'Create a Users into the system',
        type: User})
    @ApiBearerAuth()
    @Post()
    @UseGuards(RolesGuard)
    @Roles('admin')
    async create(@Body() user: User): Promise<User> {
        return this.usersService.create(user);
    }

    @ApiOperation({ summary: 'Update a User into the system' })
    @ApiResponse({
        status: 200,
        description: 'Update a User into the system',
        type: User})
    @ApiBearerAuth()
    @Put(':id')
    @UseGuards(AuthGuard('jwt'))
    update(@ReqUser() auth: User, @Param('id') id: string, @Body() newUser: User) {
        return this.usersService.updateOne(auth, id, newUser);
    }

    @ApiOperation({ summary: 'Delete a User from the system' })
    @ApiResponse({
        status: 204,
        description: 'Delete a User from the system',
        type: User})
    @ApiBearerAuth()
    @Delete(':id')
    @HttpCode(204)
    @UseGuards(RolesGuard) // Does nothing if @Roles not defined, just to check it is ignored
    @UseGuards(AuthGuard('jwt'))
    remove(@ReqUser() auth: User, @Param('id') id: string) {
        return this.usersService.deleteOne(auth, id);
    }
}
