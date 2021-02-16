import { Module } from '@nestjs/common';
import {EventGateway} from "./event.gateway";
import {ThingsModule} from "../things/things.module";

@Module({
    imports: [
        ThingsModule
    ],
    providers: [
        EventGateway
    ]
})
export class EventModule {}
