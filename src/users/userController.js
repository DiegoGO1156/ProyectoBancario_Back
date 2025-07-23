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

export const editStatusUser = async(req, res) =>{
    try {
        const {id} = req.params

        await User.findByIdAndUpdate(id, {statusAccount: "Pending", verification: false}, {new: true})

        return res.status(200).json({
            msg: "Cuenta deshabilitada con exito!"
        })
        
    } catch (err) {
        return res.status(500).json({
            msg: "Error al intentar deshabilitar la cuenta seleccionada",
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
        validatePassword(password)

        const pass = await hash(password)
        await User.findByIdAndUpdate(userId, {password: pass}, {new: true})

        return res.status(200).json({
            msg: "Contraseña actualizada con exito"
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}


//////////////////////////////////////////////////////////////////////////////////////// ADMINISTRADOR //////////////////////////////////////////////////////////////////////////////

export const listUsersPending = async (req, res) => {
    try {
        const users = await User.find({ statusAccount: "Pending" });
        return res.status(200).json({
            message: "Pending users fetched successfully",
            users
        });
    } catch (err) {
        console.error("Error fetching pending users:", err);
        return res.status(500).json({ 
            message: "Internal server error",
            error: err.message 
        });
    }
}

export const listUsersActiveUsers = async (req, res) => {
    try {
        const users = await User.find({ statusAccount: "Active" });
        return res.status(200).json({
            message: "Pending users fetched successfully",
            users
        });
    } catch (err) {
        console.error("Error fetching pending users:", err);
        return res.status(500).json({ 
            message: "Internal server error",
            error: err.message 
        });
    }
}

export const activeUsers = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findByIdAndUpdate(id, { statusAccount: "Active" }, { new: true });
        return res.status(200).json({
            message: "User activated successfully",
            user
        });
    } catch (err) {
        console.error("Error activating user:", err);
        return res.status(500).json({ 
            message: "Internal server error", 
            error: err.message
        });
    }
}

export const deleteRegisterUser = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Register deleted successfully",
            user
        });
    } catch (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

export const editBalanceUser = async(req, res) =>{
    try {
        const {id} = req.params;
        const {income} = req.body;
        const user = await User.findByIdAndUpdate(id, { income }, { new: true });
        return res.status(200).json({
            message: "User income updated successfully",
            user
        });
    } catch (err) {
        console.error("Error updating user income:", err);
        return res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

export const updateDataAdmin = async(req, res) =>{
    try {
        const user = req.user._id
        
        const {accountNumber, dpi, statusAccount, password, income, ...data} = req.body

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
