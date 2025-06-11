import express from "express";
import cors from "cors"
import helmet from "helmet";
import morgan from "morgan";
import { dbConnection } from "./mongo.js";
import {hash} from "argon2"

import authRoutes from "../src/auth/authRoutes.js"
import transferRoutes from "../src/transfers/transfer.routes.js";

import User from "../src/users/user.model.js";

const middlewares = (app) =>{
    app.use(express.urlencoded({extended: false}))
    app.use(cors())
    app.use(express.json())
    app.use(helmet())
    app.use(morgan("dev"))
}

const routes = (app) =>{
    app.use("/Valmeria_App/V1/Auth", authRoutes)
    app.use("/Valmeria_App/V1/transfers", transferRoutes)
}

const conectDB = async() =>{
    try {
        await dbConnection()
        console.log("La conexión con la base de datos ha sido exitosa!!!")
    } catch (e) {
        console.error("Error al intentar conectar con la base de datos")
        process.exit(1)
    }
}

export const initServer = async() =>{
    const app = express()
    const Port = process.env.PORT || 3000
    try {
        middlewares(app)
        conectDB()
        routes(app)
        app.listen(Port)
        console.log(`SERVER INIT IN PORT ${Port}`)
    } catch (e) {
        console.log(`SERVER FALIED INIT IN PORT ${Port}`)
    }
}

export const defaultAdmin = async() =>{
    try {
        const Adminemail = "adminb@gmail.com"
        const password = "ADMINB"
        const Adminusername = "ADMINB"
        
        const existAdmin = await User.findOne({email: Adminemail})
 
        if(!existAdmin){
            const passwordEncrypt = await hash(password)
 
            const adminUser = new User({
                name: "ADMINB",
                username: Adminusername.toLowerCase(),
                accountNumber: 1,
                email: Adminemail.toLowerCase(),
                password: passwordEncrypt,
                role: "ADMIN",
                address: "-----",
                phone: 12345678,
                companyName: "Valmeria",
                income: 0,
                statusAccount: "Active",
                dpi: 111111122,
                verification: true
            })
            await adminUser.save()
            console.log("Administrador por defecto ha sido creado exitosamente!!!")
        }else{
            console.log("Ya se ha generado el Administrador")
        }
 
    } catch (er) {
        console.error("Error al crear el Administrador ", er)
    }
}