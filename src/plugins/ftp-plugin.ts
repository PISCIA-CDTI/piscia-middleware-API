import {CorePlugin} from "./core-plugin";
import {randomFloat, readExcelToJSON} from "../utils/plugins-utils";
import {Logger, NotFoundException} from "@nestjs/common";
import * as dotenv from 'dotenv';
import axios from "axios";
import moment = require("moment");
import Client = require('ftp');
import * as csv from 'csv-parser';

export class FtpPlugin extends CorePlugin{

    async connectHardware() {
        const client = new Client ();
        let updateClient = new Client ();
        let historicValuesLoaded = false;

        this.logger.log('Getting information from a real AquaBio Device');
        const thingResponse = await axios.get(`${process.env.ROOT_URL}/things/${this.localParams["deviceId"]}`);
        if (thingResponse.status !== 200) throw new NotFoundException(`The Device measurement cannot be updated`);

        const today = moment ().format('YYYYMM');

        client.on('ready', () => {
            if (!historicValuesLoaded){
                client.list(this.localParams['deviceId'], (err, list) => {
                    if (err) throw err;
                    list.forEach(file => {
                        if (file.name !== this.localParams['deviceId']+'_'+ today + '.csv'){
                            client.get(`/${this.localParams['deviceId']}/${file.name}`, (err, stream) => {
                                if (err) throw err;
                                const results = [];
                                stream.once('close', function() { client.end(); historicValuesLoaded= true;});
                                stream.pipe(csv({separator: ','}))
                                    .on('data', (data) => results.push(data))
                                    .on('end', () => {
                                        results.forEach(data => {
                                            this.logger.log(`Updating ${this.localParams['deviceId']}- ${data['DiaHora']} - ${data[thingResponse.data.properties[this.localParams['propName']].uriVariables]}`);
                                            this.updatingMeasurement(data[thingResponse.data.properties[this.localParams['propName']].uriVariables], this.localParams['propName'], data['DiaHora'], 'DD-MM-YYYY HH:mm:ss')
                                        })

                                    });
                            });
                        }
                    });
                    client.end();
                });
            }
        });

       this.interval = setInterval(async () => {
            updateClient = new Client();
            updateClient.on('ready', () => {
                updateClient.get(`/${this.localParams['deviceId']}/${this.localParams['deviceId']}_${today}.csv`, (err, stream) => {
                    if (err) throw err;
                    const results = [];
                    stream.once('close', function() { updateClient.end(); });
                    stream.pipe(csv({separator: ','}))
                        .on('data', (data) => results.push(data))
                        .on('end', () => {
                            results.forEach(data => {
                                this.logger.log(`Updating ${this.localParams['deviceId']}- ${data['DiaHora']} - ${data[thingResponse.data.properties[this.localParams['propName']].uriVariables]}`);
                                this.updatingMeasurement(data[thingResponse.data.properties[this.localParams['propName']].uriVariables], this.localParams['propName'], data['DiaHora'], 'DD-MM-YYYY HH:mm:ss')
                            })

                        });
                });
            });
            updateClient.connect({
                host: '2.139.195.203',
                user:'imaqua',
                password:'aQua!2020#'
            });
        }, this.localParams['frequency']);


        client.connect({
            host: '2.139.195.203',
            user:'imaqua',
            password:'aQua!2020#'
        });
    }

    observedActions() {
        throw Error (' Not implemented yet');
    }

    simulate() {
        this.interval = setInterval(async () => {
            if (this.localParams['propName'] === "chlorine"){
                this.updatingMeasurement(randomFloat(0,1), "chlorine");
            } else if (this.localParams['propName'] === "waterPressure"){
                this.updatingMeasurement(randomFloat(1,9), "waterpressure");
            } else if (this.localParams['propName'] === "waterFlow"){
                this.updatingMeasurement(randomFloat(3,3.5), "waterflow");
            }
        }, this.localParams['frequency']);
    }

    stop() {
        clearInterval(this.interval);
        this.ws.close();
        this.logger.log(`${this.localParams['deviceId']} plugin stopped!`);
    }

}

async function main (){
    dotenv.config();
    const logger = new Logger ('ftp-plugin-Sabadell.ts');

    try {
        logger.log(`Getting Credentials from WoW Server...`);
        logger.log(`${process.env.ROOT_URL}/auth/login`);
        const userLogin = await axios.post(`${process.env.ROOT_URL}/auth/login`, {
            username: process.env.APP_ADMIN_USER,
            password: process.env.APP_ADMIN_PASS
        });

       logger.log(`Starting Chlorine Sensor...`);
        const chlorineSensor = new FtpPlugin(
            userLogin.data.access_token,
            {'simulate': false, 'frequency': 8.64e+7, 'deviceId': 'TCLORE01', 'propName': 'chlorine'} //TCLORE01
        );

        logger.log(`Starting Water Pressure Sensor...`);
        const waterPressure =  new FtpPlugin(
            userLogin.data.access_token,
            {'simulate': false, 'frequency': 8.64e+7, 'deviceId': 'PREPLANETES', 'propName': 'waterpressure'}
        );

       logger.log(`Starting Water Flow Sensor...`);
        const waterFlow =  new FtpPlugin(
            userLogin.data.access_token,
            {'simulate': false, 'frequency': 8.64e+7, 'deviceId': 'CABPLANETES', 'propName': 'waterflow'}
        );

        if (process.argv[2] === 'TCLORE01'){
            await chlorineSensor.start();
        }else if (process.argv[2] === 'PREPLANETES'){
            await waterPressure.start();
        }else {
            await waterFlow.start();
        }

        process.on('SIGINT', () => {
            chlorineSensor.stop();
            waterPressure.stop();
            waterFlow.stop();
        })

    }catch (error){
        throw error;
    }

}

main();