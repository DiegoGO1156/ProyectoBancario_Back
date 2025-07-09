import {validatePassword} from "../middlewares/validatorPasswords.js"
import User from "./user.model.js"
import { hash, verify } from "argon2"

export const listDataUser = async(req, res) =>{
    try {
        const user = req.user._id

        const listData = await User.findById(user)

        return res.status(200).json({
            msg: "Datos encontrados",
            listData
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

export const updateDatauser = async(req, res) =>{
    try {
        const user = req.user._id
        
        const {accountNumber, dpi, statusAccount, password, ...data} = req.body

        const editData = await User.findByIdAndUpdate(user,{...data}, {new: true})

        return res.status(200).json({
            msg: "Datos actualizados con exito!",
            editData
        })
        
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

export const updatePassword = async(req, res) =>{
    try {
        const userId = req.user._id
        const { oldPassword, password } = req.body
        console.log(userId)

        const userFounded = await User.findById(userId)
        const verifyPass = await verify(userFounded.password, oldPassword)

        if(!verifyPass){
            return res.status(401).json({
                msg: `The password ${oldPassword} is Incorrect`
            })
        }
        validatePassword(newPassword)

        const pass = await hash(newPassword)
        await User.findByIdAndUpdate(id, {password: pass}, {new: true})

        return res.status(200).json({
            msg: "Contraseña actualiada con exito"
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}
