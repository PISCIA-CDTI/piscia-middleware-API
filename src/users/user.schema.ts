import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema({
    username: String,
    fullname: String,
    organization: String,
    email: String,
    password: String,
    roles: [String]
},{
    timestamps: {
      createdAt: 'created',
      updatedAt: 'updated'
    },
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
        }
    }
});
