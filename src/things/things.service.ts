import {Injectable, Logger, NotFoundException} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import { Model } from 'mongoose';
import {Thing} from "./thing";
import {DuplicateIdentifierException} from "../utils/duplicate-identifier.exception";
import {Property} from "../property/property";
import {isoTimestamp} from "../utils/plugins-utils";

@Injectable()
export class ThingsService {
    private logger = new Logger (ThingsService.name);

    constructor(@InjectModel('Thing') private readonly thingModel: Model<Thing> | any,
                @InjectModel('Property') private readonly propertyModel: Model<Property> | any,)
    {}

    private async setProperties (properties, newThing){
        if (!properties) return undefined;
        for (const key of Object.keys(properties)) {
            properties[key]['id'] = newThing.id + '/properties/'+ key;
            properties[key]['thingId'] = newThing.id;
            properties[key]['title'] = key;

            let newProperty = new this.propertyModel(properties[key]);
            if (await this.propertyModel.exists({id: key})){
                newProperty = await this.propertyModel.findOne({id: key})
            }else {
                newProperty = await newProperty.save();
            }
            newThing.properties.push(newProperty);
        }
        return newThing;
    }

    findAll(): Promise<Thing | Thing[]> {
        return this.thingModel.find()
            .populate ('properties');
    }

    findOne(id: string): Promise<Thing>{
        return this.thingModel.findOne({id: id})
            .populate('properties');
    }

    async findOneProperty(id: string, time: string, timeEnd: string): Promise<any>{

        if (!timeEnd) {
            timeEnd = isoTimestamp();
        }

        let property = !time ? await this.propertyModel.findOne(
            {id: id}
        )
            .sort({ 'updatedAt' : -1 })
            .select({ "title": 1, "description": 1, "unit":1, "values": { "$slice": -1 }}) :

            await this.propertyModel.aggregate([
                { $match: {id: id}},
                {
                    $project: {
                        "_id": 0,
                        title: 1,
                        description: 1,
                        unit: 1,
                        values: {
                            $filter: {
                                input: "$values",
                                as: "item",
                                cond:  {
                                    "$and": [
                                        {$gte: ["$$item.time", Date.parse(new Date(time).toISOString())]},
                                        {$lt: ["$$item.time", Date.parse(new Date(timeEnd).toISOString())]},
                                    ]
                                }
                            }
                        }
                    }
                }
                ]);
        property = Array.isArray(property)? property[0]: property;
        return property?.values.length >0? property: {};
    }

    async findAllProperties(id: string) {
        return this.propertyModel.find({thingId:id, $where: "this.values.length > 0" })
            .sort({ 'updatedAt' : -1 })
            .select({ "title": 1, "description": 1,"unit":1, "values": { "$slice": -1 }})
    }

    async create (thing: Thing){
        if (await this.exists(thing.id)){
            throw new DuplicateIdentifierException(`${thing.id}`);
        }

        // let newThing = new this.thingModel(thing);

        const otherThing = JSON.parse(JSON.stringify(thing));
        delete otherThing.properties;

        let newThing = new this.thingModel(otherThing);
        newThing.id = process.env.ROOT_URL + '/things/' + newThing.id;
        newThing.properties = [];

        if (!newThing.hasOwnProperty('@context')){
            newThing['@context'] = [
                'http://ibathwater.com/context.jsonld',
                'http://ibathwater.com/geo-context.jsonld'
            ]
        }

        return (await this.setProperties(thing.properties, newThing)).save();
        // return newThing.save();
    }

    async putProperty(id: string, propertyValue = { }) {
        if (await this.exists(id)) {
            throw new DuplicateIdentifierException(`${id}`);
        }
        propertyValue['time'] = Date.parse(new Date(propertyValue['timestamp']).toISOString());
        let property = await this.propertyModel.findOneAndUpdate(
            {
                id: id,
                bucket: {$lt: 10000}},
            {
                "$push": {"values": propertyValue},
                "$min": { first: propertyValue['time']},
                "$max": { last: propertyValue['time']},
                "$inc": { bucket: 1}
            },
            {new: true, "upsert": true });
        return property? propertyValue: {};
    }

    exists(id: string): Promise<boolean>{
        return this.thingModel.exists({id: id});
    }

    async updateOne (id: string, thing: Thing){
        return this.thingModel.findOneAndUpdate({id: id}, thing, {new: true});
    }

    async deleteOne(id:string){
        return this.thingModel.findOneAndDelete({id:id});
    }


}
