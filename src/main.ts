import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Seeder } from './seeder';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import MongoMemoryServer from 'mongodb-memory-server-core';
import axios from 'axios';
import {Logger} from "@nestjs/common";
import {registerThings} from "./utils/plugins-utils";
import {WsAdapter} from "@nestjs/platform-ws";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import { CoapPlugin } from "./plugins/coap-plugin";
import { CoapServer } from "./servers/coap-server";
import { ElectricityMeter } from "./plugins/electricity-meter";
import { FlowMeter } from "./plugins/flow-meter";

async function bootstrap() {

  const logger = new Logger ('Main.ts');


  // Run with in-memory Mongo
  if (process.env.INMEMORY_MONGODB === 'true') {
    const mongod = new MongoMemoryServer();
    process.env.MONGODB_URI = await mongod.getUri();
  }

  const options = new DocumentBuilder()
      .setTitle('PISCIA Semantic Sensor Hub')
      .setDescription('The open documentation shows the interaction with the PISCIA Things and systems')
      .setVersion('1.0')
      .addBearerAuth(
          { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          'access_token',
      )
      .build();

  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.enableCors({
    'origin': configService.get('ORIGIN', '*').split(','),
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false,
    'optionsSuccessStatus': 204
  });

  const seeder = app.get(Seeder);
  await seeder.seed();
  await app.listen(configService.get('PORT', 3000));

  logger.log(`Requesting user at: ${`${process.env.ROOT_URL}/auth/login`}`)

  try {
    const userLogin = await axios.post(`${process.env.ROOT_URL}/auth/login`, {
      username: process.env.APP_ADMIN_USER,
      password: process.env.APP_ADMIN_PASS
    });

    /*logger.log(`Loading all Things...`);
    const status = await registerThings(userLogin.data.access_token);*/


    logger.log(`Initiating devices...`);

    const coapPlugin = new CoapPlugin(userLogin.data.access_token, {'simulate': false, 'frequency': 2000, 'deviceId': 'coap-1', 'propName': 'co2'});
    const coapServer = new CoapServer();

    coapServer.start();
    await coapPlugin.start();

    const electricityMeter = new ElectricityMeter(userLogin.data.access_token, {'simulate': false, 'frequency': 360000, 'deviceId': 'electricityMeter-1', 'propName': 'electricity'});
    await electricityMeter.start();

    const FlowMeter1 = new FlowMeter(userLogin.data.access_token, {'simulate': true, 'frequency': 360000, 'deviceId': 'EBAP-29489', 'propName': 'flowmeter'});
    await FlowMeter1.start();

    const FlowMeter2 = new FlowMeter(userLogin.data.access_token, {'simulate': true, 'frequency': 360000, 'deviceId': 'MOLINILLO-PUEBLO-29491', 'propName': 'flowmeter'});
    await FlowMeter2.start();

    const FlowMeter3 = new FlowMeter(userLogin.data.access_token, {'simulate': true, 'frequency': 360000, 'deviceId': 'MOLINILLO-RIO-VERDE-29492', 'propName': 'flowmeter'});
    await FlowMeter3.start();




    //if (!status) process.exit();


  } catch(error){
    throw error;
  }

}
bootstrap();
