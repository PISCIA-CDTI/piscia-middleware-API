import * as mongoose from 'mongoose';

export const ThingSchema = new mongoose.Schema({
    "@context": [String],
    "@type": [String],
    id: {type: String, unique: true, index: true},
    title: String,
    base: String,
    description: String,
    customFields: {},
    links: [{
        rel: String,
        mediaType: String,
        href: String
    }],
    properties: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property'
        }
    ]
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt'},
    strict: false,
    toJSON: {
        versionKey: false,
        transform: (doc, ret) => {
            delete ret._id;
            ret.links.forEach(link => delete link._id);
            const originalProperties = JSON.parse(JSON.stringify(ret.properties));
            ret.properties = {};
            originalProperties.forEach(prop => {
                ret.properties[prop.title.toLowerCase()] = prop;
                delete prop.id;
                delete prop.values;
            });
        }
    }
});