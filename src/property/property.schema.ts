import * as mongoose from 'mongoose';


export const PropertySchema = new mongoose.Schema({
    "@type": [String],
    id: {type: String,  index: true},
    thingId: String,
    type: String,
    title: String,
    description: String,
    unit: String,
    maximun: Number,
    minimun: Number,
    readOnly: Boolean,
    first: {type: Number, default: Date.parse(new Date().toISOString())},
    last: {type: Number, default:  Date.parse(new Date().toISOString())},
    bucket: {type: Number, index: true, default: 0},
    links: [{
        rel: String,
        mediaType: String,
        href: String
    }],
    values: Array
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt'},
    strict: false,
    toJSON: {
        versionKey: false,
        transform: (doc, ret) => {
            delete ret._id;
            delete ret.thingId;
            delete ret.time;
            //ret.links.forEach(link => delete link._id);
        }
    }
});
