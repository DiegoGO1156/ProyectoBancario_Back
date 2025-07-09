import { Schema, model } from "mongoose";

const ServiceSchema = new Schema({
    nameService: {
        type: String,
        unique: true
    },
    image: {
        type: String
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: 'brand',
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    exclusivitive: {
        type: Number,
        default: 7000,
    },
    exclusive: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true,
    versionKey: false
})

export default model('Service', ServiceSchema)