import {Link} from "./link";
import {Property} from "../property/property";
import {ApiProperty} from "@nestjs/swagger";

export class Thing {
    @ApiProperty({ example: '[\n' +
            '                \'http://ibathwater.com/context.jsonld\',\n' +
            '                \'http://ibathwater.com/geo-context.jsonld\'\n' +
            '            ]', description: 'Context information about the thing' })
    "@context": string | Array<string>;

    @ApiProperty({ example: '[s4watr:WaterDevice]', description: 'Type of the thing' })
    "@tyoe": string | Array<string>;

    @ApiProperty({ example: 'http://localhost:3000/things/barcelona-aquaBio-1', description: 'Id of the thing' })
    id: string;
    @ApiProperty({ example: 'AquaBio-1', description: 'Title of the thing' })
    title: string;
    @ApiProperty({ example: 'http://localhost:3000/things/barcelona-aquaBio-1', description: 'Base Url if external service' })
    base: string;
    @ApiProperty({ example: 'Aqua-Bio device', description: 'A description of the thing' })
    description: string;

    @ApiProperty({ example: '[\n' +
            '      {\n' +
            '        "href": "https://ibathwater.herokuapp.com/flussbad/predictions"\n' +
            '      }\n' +
            '    ]', description: 'A external links description of the thing' })
    links: Link[];

    @ApiProperty({ example: '{"turbidity": {\n' +
            '        "@type": [],\n' +
            '        "first": 1593778880053,\n' +
            '        "last": 1593778880053,\n' +
            '        "bucket": 0,\n' +
            '        "description": "Turbidity Measurement",\n' +
            '        "type": "number",\n' +
            '        "unit": "V",\n' +
            '        "readOnly": true,\n' +
            '        "title": "turbidity",\n' +
            '        "links": [],\n' +
            '        "createdAt": "2020-07-03T12:21:21.599Z",\n' +
            '        "updatedAt": "2020-07-03T12:21:21.599Z"\n' +
            '      }}', description: 'The properties of the thing' })
    properties: {
        [propName: string]: Property
    } = {};

    customFields: {
        [key: string]: string
    };

    constructor(values: object = {}) {
        Object.assign(this as Thing, values);
    }
}
