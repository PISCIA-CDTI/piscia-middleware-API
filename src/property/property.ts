import {Link} from "../things/link";
import {IsDate} from "class-validator";

export class Property {
    '@type': string;
    type: string;
    title: string;
    description: string;
    unit: string;
    minimun: number;
    maximun: number;
    readOnly: boolean;
    links: Link[];
    values: any [];
}
