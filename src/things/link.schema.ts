import * as mongoose from 'mongoose';

export const LinkSchema = new mongoose.Schema({
    rel: String,
    mediaType: String,
    href: String
});