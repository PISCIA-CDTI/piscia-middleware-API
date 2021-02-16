import {findThing, isoTimestamp} from "../utils/plugins-utils";
import {Logger} from "@nestjs/common";
import * as WebSocket from 'ws';
import moment = require("moment");

export abstract class CorePlugin {
    protected logger = new Logger(CorePlugin.name);
    protected interval;
    protected token = '';
    protected localParams: object = {'simulate': false, 'frequency': 2000, 'deviceId': '', 'propName': ''};
    protected model;
    protected ws;

    constructor (token: string, params: object){
        if(params) this.localParams = params;
        this.token = token;
        this.ws = new WebSocket(`ws://${process.env.ROOT_URL.split('http://')[1]}`)
    }

    public async start(){
        this.model = await findThing(this.localParams['deviceId']);
        if(this.localParams['simulate']){
            this.simulate();
        }
        else {
            this.connectHardware();
        }

        this.logger.log(`[plugin started] ${this.localParams["deviceId"]}`);
    }

    protected async updatingMeasurement(value: any, paramName: string, timestamp?: string, formatter?: string): Promise<void>{
        const measurement= {}
        measurement[paramName] = value
        if (timestamp){
            if (formatter){
                measurement['timestamp']= moment (timestamp, formatter).toISOString(); 
            }else{
                measurement['timestamp']= moment (timestamp).toISOString();
            }
        }
        else {
            measurement['timestamp'] = isoTimestamp();
        }
        this.logger.log(`updating at ${process.env.ROOT_URL}/things/${this.localParams["deviceId"]}/properties/${paramName}`)

        this.logger.log(` ${moment (timestamp, formatter).toISOString()}`);
        this.logger.log(` ${isoTimestamp()}`);

        this.ws.send(JSON.stringify({
            event: "wow-data",
            data: {
                id:`${process.env.ROOT_URL}/things/${this.localParams["deviceId"]}/properties/${paramName}`,
                measurement: measurement
            }
        }));
    }

    abstract connectHardware();
    abstract simulate();
    abstract observedActions();
    abstract stop();
}