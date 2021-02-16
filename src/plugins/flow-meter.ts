import {CorePlugin} from "./core-plugin";
import {randomFloat, readExcelToJSON} from "../utils/plugins-utils";
import axios from "axios";
import {Logger, NotFoundException} from "@nestjs/common";
import * as dotenv from 'dotenv';

export class FlowMeter extends CorePlugin {

    constructor(token: string, params: object) {
        super(token, params);
    }

    async connectHardware() {
        this.logger.log('Introduce consumption information');
    }

    observedActions() {
        throw Error(' Not implemented yet');
    }

    simulate() {
        this.interval = setInterval(async () => {
            this.updatingMeasurement(randomFloat(1, 200), this.localParams['propName']);
        }, this.localParams['frequency']);
    }

    stop() {
        clearInterval(this.interval);
        this.logger.log(`${this.localParams['deviceId']} plugin stopped!`);
    }
}

async function main (){

    dotenv.config();
    const logger = new Logger ('electricity-meter.ts');

    try{

        logger.log(`Getting Credentials...`);
        logger.log(`${process.env.ROOT_URL}/auth/login`);
        const userLogin = await axios.post(`${process.env.ROOT_URL}/auth/login`, {
            username: process.env.APP_ADMIN_USER,
            password: process.env.APP_ADMIN_PASS
        });

        logger.log(`Starting electricity-meter Plugin...`);
        const options = {'simulate': false, 'frequency': 360000, 'deviceId': 'electricityMeter-1', 'propName': 'electricity'}

        if (process.argv[2] == 'SIMULATION'){
            options.simulate = true;
        }

        const elecDevice = new FlowMeter(
            userLogin.data.access_token,
            options
        );

        await elecDevice.start();

        process.on('SIGINT', () => {
            elecDevice.stop();
        })


    }catch(error){
        throw error;
    }
}

//main();

