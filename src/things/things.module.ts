import {Global, Module} from '@nestjs/common';
import { ThingsController } from './things.controller';
import { ThingsService } from './things.service';
import {MongooseModule} from "@nestjs/mongoose";
import {ThingSchema} from "./thing.schema";
import {PropertySchema} from "../property/property.schema";

@Global()
@Module({
  imports: [
      MongooseModule.forFeature([{ name: 'Thing', schema: ThingSchema }]),
      MongooseModule.forFeature([{ name: 'Property', schema: PropertySchema }]),
  ],
  controllers: [ThingsController],
  providers: [ThingsService],
  exports: [ThingsService]
})
export class ThingsModule {}
