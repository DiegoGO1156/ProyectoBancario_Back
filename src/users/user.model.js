import { Schema, model } from "mongoose";

const userModel = new Schema({
    name: {
        type: String,
        required: true
    },
    username:{
        type: String,
        required: true
    },
    accountNumber:{
        type: Number,
        required: true,
        unique: true
    },
    dpi:{
        type: Number,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    companyName:{
        type: String,
        required: true
    },
    income:{
        type: Number,
        requirede: true
    },
    role:{
        type: String,
        enum: ["USER", "ADMIN", "ADMIN_PAGE"],
        default: "USER"
    },
    statusAccount:{
        type: String,
        enum: ["Pending", "Active"],
        default: "Pending"
    },
    verification:{
        type: Boolean,
        default: false
    },
    divisas:{
        type: String,
        default: 'GTQ'
    },
    status:{
        type: Boolean,
        default: true
    }
},
    {
        timestamps: true,
        versionKey: false
    }
)

export default model("User", userModel)