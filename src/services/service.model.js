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