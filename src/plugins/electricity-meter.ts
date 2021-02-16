import {CorePlugin} from "./core-plugin";
import {randomFloat, readExcelToJSON} from "../utils/plugins-utils";
import axios from "axios";
import {Logger, NotFoundException} from "@nestjs/common";
import * as dotenv from 'dotenv';

export class ElectricityMeter extends CorePlugin {

    constructor(token: string, params: object) {
        super(token, params);
    }

    async connectHardware() {
        this.logger.log('Introduce consumption information');
        const consumptionInformation = [
            {
                data: 110650,
                timestamp: "2018-02-01 07:00:00.000"
            },
            {
                data: 106504,
                timestamp: "2018-03-01 07:00:00.000"
            },
            {
                data: 14403,
                timestamp: "2018-04-01 07:00:00.000"
            },
            {
                data: 45006,
                timestamp: "2018-05-01 07:00:00.000"
            },
            {
                data: 117794,
                timestamp: "2018-06-01 07:00:00.000"
            },
            {
                data: 156006,
                timestamp: "2018-07-01 07:00:00.000"
            },
            {
                data: 181366,
                timestamp: "2018-08-01 07:00:00.000"
            },
            {
                data: 200500,
                timestamp: "2018-09-01 07:00:00.000"
            },
            {
                data: 151462,
                timestamp: "2018-10-01 07:00:00.000"
            },
            {
                data: 53412,
                timestamp: "2018-11-01 07:00:00.000"
            },
            {
                data: 6463,
                timestamp: "2018-12-01 07:00:00.000"
            },
            {
                data: 1828,
                timestamp: "2019-01-01 07:00:00.000"
            },
            {
                data: 2964,
                timestamp: "2019-02-01 07:00:00.000"
            },
            {
                data: 1136,
                timestamp: "2019-03-01 07:00:00.000"
            },
            {
                data: 47663,
                timestamp: "2019-04-01 07:00:00.000"
            }
        ]

        consumptionInformation.forEach(value => this.updatingMeasurement(value.data, this.localParams['propName'], value.timestamp, 'YYYY-MM-DD hh:mm:ss.SSS'))
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

        const elecDevice = new ElectricityMeter(
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

