import axios from 'axios';
import * as fs from 'fs-extra';
import * as csv from 'csv-parser';

export const randomInt = (low, high) => {
    return Math.floor(Math.random() * (high - low + 1) + low);
};

export const randomFloat = (low, high) => {
    return parseFloat((Math.random() * (high - low + 1) + low).toFixed(2));
};

export const addDevice = async (token: string, device) => {
    try{
        const response = await axios.post(`${process.env.ROOT_URL}/things`,
            device,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+ token
                }
            });
        return response.status;
    }catch(error){
        throw error;
    }
}

export const registerThings = async (token: string) => {
    const files = fs.readdirSync('src/data');
    for (const file of files) {
        const thing = await fs.readJSON('src/data/'+file);
        await addDevice(token, thing);
    }
    return true;
}

export const isoTimestamp = () => {
    const date = new Date();
    return date.toISOString();
};

export const findThing = async (thingId: string) => {
    try{
        const thingModel= await axios.get(`${process.env.ROOT_URL}/things/${thingId}`);
        return thingModel.data;
    }catch (error){
        throw error;
    }
}

export const readExcelToJSON = async (filePath: string, separator = ';'): Promise<any[]> => {
    const result = [];
    return  new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
            .pipe(csv({separator: separator}))
            .on('data', (data) => result.push(data))
            .on('error', error => reject(error))
            .on('end', () => {
                resolve (result);
            })
    });
}