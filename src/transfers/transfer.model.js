import mongoose from "mongoose";

const { Schema, model, models } = mongoose

const transferModel = new Schema({
    senderName:{
        type: String,
    },
    addresserName:{
        type: String,
    },
    senderRef: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "The sender is required."],
    },
    addresserRef: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    amount:{
        type: Number,
        required: true,
        required: [true, "The amount is required."],
    },
    senderNumber:{
        type: Number
    },
    addresserNumber:{
        type: Number
    },
    motive:{
        type: String,
        required: [true, "The motive is required."],
        maxLength: [250, "Cant be overcome 250 characters"]
    },
    productName:{
        type: String,
    },
    serviceName:{
        type: String,
    },
    productRef: {
      type: Schema.Types.ObjectId,
      ref: "Product"
    },
    serviceRef: {
      type: Schema.Types.ObjectId,
      ref: "Product"
    },
    verification:{
        type: Boolean,
        default: false
    },
    verificationEmail:{
        type: Boolean,
        default: false
    },
    date:{
        type: String,
    },
    status:{
        type: Boolean,
        default: true
    },
},
    {
        timestamps: true,
        versionKey: false
    }
)

export default models.Transfer || model("Transfer", transferModel)