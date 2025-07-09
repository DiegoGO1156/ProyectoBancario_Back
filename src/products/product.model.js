import { Schema, model } from "mongoose";

const ProductSchema = new Schema({
    nameProduct: {
        type: String,
        unique: true
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    price:{
        type: Number,
        required: true
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: 'brand',
        required: true
    },
    exclusivitive: {
        type: Number,
        default: 7000,
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

export default model('Product', ProductSchema)