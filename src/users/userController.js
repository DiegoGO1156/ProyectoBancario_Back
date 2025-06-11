import { verifyPassword } from "../middlewares/verifyPassword.js"
import {validatePassword} from "../middlewares/validatorPasswords.js"
import User from "./user.model.js"

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
        const user = req.user._id
        const {password, newPassword} = req.body

        verifyPassword(newPassword)
        validatePassword(newPassword)

        await User.findByIdAndUpdate(user, {password: newPassword}, {new: true})

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


//////////////////////////////////////////////////////////////////////////////////////// ADMINISTRADOR //////////////////////////////////////////////////////////////////////////////

export const listUsersPending = async (req, res) => {
    try {
        const users = await User.find({ status: "pending" });
        return res.status(200).json({
            message: "Pending users fetched successfully",
            users
        });
    } catch (err) {
        console.error("Error fetching pending users:", error);
        return res.status(500).json({ 
            message: "Internal server error",
            error: err.message 
        });
    }
}

export const activeUsers = async (req, res) => {
    try {
        const {id} = req.params;
        const user = await User.findByIdAndUpdate(id, { status: "Active" }, { new: true });
        return res.status(200).json({
            message: "User activated successfully",
            user
        });
    } catch (err) {
        console.error("Error activating user:", error);
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
