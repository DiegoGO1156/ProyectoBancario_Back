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
        const { id } = req.params
        const { oldPassword, newPassword } = req.body

        const userFounded = await User.findById(id)


        console.log(userFounded.password)
        const verifyPass = await verify(userFounded.password, oldPassword)
        console.log(verifyPass)

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
/*
export const listHistorialTransfer = async(req, res) =>{
    try {
        const idUser = req.user._id

        const {limite = 5, desde = 0} = req.query

        const query = {_id: idUser}
        const [total, transfers] = await Promise.all([

        ])

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}
*/
