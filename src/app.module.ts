import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from './auth/auth.module';
import { UtilsModule } from './utils/utils.module';
import { Seeder } from './seeder';
import { ThingsModule } from './things/things.module';
import { ProjectModule } from './project/project.module';
import { PropertyModule } from './property/property.module';
import { EventModule } from './event/event.module';
import { EventGateway } from './event/event.gateway';
import {ThingsService} from "./things/things.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI', 'mongodb://piscia:password@localhost:27017/piscia'),
        useNewUrlParser: true, /*useUnifiedTopology: true,*/ useFindAndModify: false
      }),
    }),
    AuthModule, UtilsModule, UsersModule, ThingsModule, ProjectModule, PropertyModule, EventModule,
  ],
  providers: [Seeder],
  controllers: [AppController],
})
export class AppModule {}
