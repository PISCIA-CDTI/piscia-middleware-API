import {Body, Controller, Get, Logger, Post, Put, UseGuards} from '@nestjs/common';
import {Roles} from "../auth/roles.decorator";
import {AuthGuard} from "@nestjs/passport";
import {Property} from "./property";

@Controller('properties')
export class PropertyController {
    private logger = new Logger (PropertyController.name);
}
