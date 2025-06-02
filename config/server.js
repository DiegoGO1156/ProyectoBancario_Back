import express from "express";
import cors from "cors"
import helmet from "helmet";
import morgan from "morgan";
import { dbConnection } from "./mongo.js";


const middlewares = (app) =>{
    app.use(express.urlencoded({extended: false}))
    app.use(cors())
    app.use(express.json())
    app.use(helmet())
    app.use(morgan("dev"))
}

const routes = (app) =>{

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
        //routes(app)
        app.listen(Port)
        console.log(`SERVER INIT IN PORT ${Port}`)
    } catch (e) {
        console.log(`SERVER FALIED INIT IN PORT ${Port}`)
    }
}