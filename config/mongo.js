"use strict"
import mongoose from "mongoose"

export const dbConnection = async() =>{
    try {
        mongoose.connection.on("error", () =>{
            console.log("MONGO DB error || error conection to MONGODB")
            mongoose.disconnect()
        })
        mongoose.connection.on("connecting", () =>{
            console.log("MONGODB Connection | Trying to connect to MONGODB")
        })
        mongoose.connection.on("connected", () =>{
            console.log("MONGODB | Connected to MONGODB")
        })
        mongoose.connection.on("reconnected", () =>{
            console.log("MONGO DB | reconnected to MONGODB")
        })
        mongoose.connection.on("disconnected", () =>{
            console.log("MONGODB | disconnected")
        })

        mongoose.connect(process.env.URI_MONGO ,{
            serverSelectionTimeoutMS: 5000,
            maxPoolsize: 50
        })
    } catch (err) {
        console.error(err)
    }
}