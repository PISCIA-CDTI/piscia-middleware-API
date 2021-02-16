import { IsEmail, IsNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class User {
    @ApiProperty({ example: 'aolite', description: 'The username of the User' })
    @IsNotEmpty()
    username: string;
    @ApiProperty({ example: 'aolite@ibw.com', description: 'The email of the User' })
    @IsEmail()
    email: string;
    @ApiProperty({ example: '1234', description: 'The password of the User' })
    @IsNotEmpty()
    password: string;
    @ApiProperty({ example: 'aolite', description: 'The name of the User' })
    fullname: string;
    @ApiProperty({ example: 'acme', description: 'The company of the User' })
    organization: string;
    @ApiProperty({ example: '[admin]', description: 'The role of the User' })
    roles: string[];
    created: Date;

    constructor(values: object = {}) {
        Object.assign(this as User, values);
    }
}
