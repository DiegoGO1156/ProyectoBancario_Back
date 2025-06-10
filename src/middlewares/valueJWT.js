import User from "../users/user.model.js";
import jwt from "jsonwebtoken";

export const valueJWT = async (req, resp, next)=>{
<<<<<<< HEAD
    try {
    const token = req.header("x-token");
=======
    const token = req.header("Authorization");
>>>>>>> 91b24b37ba8e4d5377017978c76ba005b687c7d6

    if(!token){
        return resp.status(401).json({
            msg: "No hay token para la petición"
        })
    }
<<<<<<< HEAD
    const {uid} = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
    
    const usuario = await User.findById(uid)
    if(!usuario){
        return resp.status(401).json({
            msg:"usuario no existe en la base de datos"
        })
    }
    if(!usuario.status){
        return resp.status(401).json({
            msg:"Token no valido - usuario con estado: False"
        })
    }
=======
    try {
        const {uid} = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
        const usuario = await User.findById(uid)
        if(!usuario){
            return resp.status(401).json({
                msg:"usuario no existe en la base de datos"
            })
        }
        if(!usuario.status){
            return resp.status(401).json({
                msg:"Token no valido - usuario con estado: False"
            })
        }
>>>>>>> 91b24b37ba8e4d5377017978c76ba005b687c7d6
        req.user = usuario;
        next();
    } catch (e) {
        console.log(e)
        resp.status(401).json({
            msg: "Token no valido"
        })
    }
}