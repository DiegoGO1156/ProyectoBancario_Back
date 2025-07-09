import { Schema, model } from "mongoose";

const BrandSchema = new Schema({
    nameBrand: {
        type: String,
        unique: true
    },
    image: {
        type: String
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

export default model('Brand', BrandSchema)