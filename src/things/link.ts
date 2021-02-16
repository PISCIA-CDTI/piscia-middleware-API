import {IsUrl} from "class-validator";

export class Link {

    rel: string
    mediaType?: string;

    @IsUrl()
    href: string;

    constructor(values: object = {}) {
        Object.assign(this as Link, values);
    }
}
