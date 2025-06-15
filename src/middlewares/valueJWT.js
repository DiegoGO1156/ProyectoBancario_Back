import User from "../users/user.model.js";
import jwt from "jsonwebtoken";

export const valueJWT = async (req, resp, next)=>{
    const token = req.header("Authorization");

    if(!token){
        return resp.status(401).json({
            msg: "No hay token para la petición"
        })
    }
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
        req.user = usuario;
        next();
    } catch (e) {
        console.log(e)
        resp.status(401).json({
            msg: "Token no valido"
        })
    }
}