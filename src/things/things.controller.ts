import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Logger,
    Param,
    Post,
    Put, Query,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {AuthGuard} from "@nestjs/passport";
import {Thing} from "./thing";
import {ThingsService} from "./things.service";
import {Roles} from "../auth/roles.decorator";
import {ConverterInterceptor} from "../middlewares/converter.interceptor";
import {ApiBearerAuth, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";


@ApiTags('Thing')
@Controller('things')
@UseInterceptors(ConverterInterceptor)
export class ThingsController {
    private logger = new Logger (ThingsController.name);

    constructor(private readonly thingService: ThingsService) {}

    @ApiOperation({ summary: 'Obtain all stored water devices' })
    @ApiResponse({
        status: 200,
        description: 'All water devices',
        type: [Thing] })
    @Get()
    async findAll (): Promise<Thing | Thing [] >{
        return this.thingService.findAll();
    }

    @ApiOperation({ summary: 'Obtain the model of the water devices' })
    @ApiResponse({
        status: 200,
        description: 'All water devices',
        type: [Thing] })
    @Get('/model')
    async findModel (): Promise<Thing | Thing [] >{
        return this.thingService.findAll();
    }

    @ApiOperation({ summary: 'Obtain one specific water device' })
    @ApiResponse({
        status: 200,
        description: 'Obtain one specific water device',
        type: Thing })
    @Get(':id')
    async findOne (@Param('id') id: string): Promise<Thing>{
        return this.thingService.findOne(process.env.ROOT_URL + '/things/'+ id);
    }

    @ApiOperation({ summary: 'Obtain a specific measurement for a property' })
    @ApiResponse({
        status: 200,
        description: 'Obtain a specific measurement for a property'})
    @Get(':id/properties/:propType')
    findOneProperty(@Param('id') id: string,
                    @Param('propType') propType: string,
                    @Query('time') time,
                    @Query('timeEnd') timeEnd): Promise<any>{
        return this.thingService.findOneProperty(process.env.ROOT_URL + '/things/'+ id+'/properties/'+propType, time, timeEnd);
    }

    @ApiOperation({ summary: 'Obtain all specific measurement for all property in a corresponding thing' })
    @ApiResponse({
        status: 200,
        description: 'Obtain all specific measurement for all property in a corresponding thing'})
    @Get(':id/properties')
    findAllProperties(@Param('id') id: string): Promise<any>{
        return this.thingService.findAllProperties(process.env.ROOT_URL + '/things/'+ id);
    }

    @ApiOperation({ summary: 'Create a new Device into the platform' })
    @ApiResponse({
        status: 201,
        description: 'Create a new device into the platform',
        type: Thing })
    @ApiBearerAuth()
    @Post()
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'))
    async create(@Body() thing: Thing): Promise<Thing>{
        return this.thingService.create(thing);
    }

    @ApiOperation({ summary: 'Update a Device into the platform' })
    @ApiResponse({
        status: 201,
        description: 'Update a Device into the platform',
        type: Thing })
    @ApiBearerAuth()
    @Put(':id')
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'))
    async updateOne (@Param('id') id: string, @Body() thing: Thing): Promise<Thing>{
        return this.thingService.updateOne(process.env.ROOT_URL + '/things/'+ id, thing);
    }

    @ApiOperation({ summary: 'Introduce a new measurement into the system' })
    @ApiResponse({
        status: 201,
        description: 'Introduce a new measurement into the system'})
    @ApiBearerAuth()
    @Put(':id/properties/:propType')
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'))
    setProperty (@Param('id') id: string, @Param('propType') propType: string, @Body() property: any): Promise<any>{
        return this.thingService.putProperty(process.env.ROOT_URL + '/things/'+ id+'/properties/'+propType, property);
    }

    @ApiOperation({ summary: 'Remove a device from the platform' })
    @ApiResponse({
        status: 201,
        description: 'Remove a device from the platform'})
    @ApiBearerAuth()
    @Delete(':id')
    @HttpCode(204)
    @Roles('admin')
    @UseGuards(AuthGuard('jwt'))
    async deleteOne(@Param('id') id: string): Promise<void>{
        return this.thingService.deleteOne(process.env.ROOT_URL + '/things/'+ id);
    }
}
