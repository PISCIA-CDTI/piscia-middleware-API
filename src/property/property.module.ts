import { Module } from '@nestjs/common';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import {MongooseModule} from "@nestjs/mongoose";
import {PropertySchema} from "./property.schema";

@Module({
  imports:[
    MongooseModule.forFeature([{ name: 'Property', schema: PropertySchema }]),
  ],
  controllers: [PropertyController],
  providers: [PropertyService]
})
export class PropertyModule {}
