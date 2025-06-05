import { generarJWT } from "../helpers/generateJWT.js";
import User from "../users/user.model.js";
import { hash, verify } from "argon2";
import { validateDPI } from "../middlewares/validateDPI.js";
import { validatePassword } from "../middlewares/validatorPasswords.js";

export const login = async(req, res) =>{
    try {
        
        const {email, username, password} = req.body

        const lowerEmail = email ? email.toLowerCase() : null

        const findUser = await User.findOne({
            $or: [{email: lowerEmail}, {username: username}]
        })

        const validPass = await verify(findUser.password, password)

        if(!validPass){
            return res.status(401).json({
                success:false,
                msg: "Incorrect password"
            })
        }

        const token = await generarJWT(findUser.id)

        return res.status(200).json({
            userDetails:{
                username: findUser.username,
                status: findUser.statusAccount,
                role: findUser.role,
                token: token
            }
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}

export const register = async(req, res) =>{
    try {
        const {accountNumber, ...data} = req.body

        const newAccountNumber = Math.floor(Math.random()*(9999999999 - 1000000000 + 1000000000)) + 1000000000
        validatePassword(data.password)

        const encryptPass = await hash(data.password)

        validateDPI(data.dpi);

        const userData = await User.create({
            ...data,
            accountNumber: newAccountNumber,
            password: encryptPass,
            username: data.username.toLowerCase(),
            email: data.email.toLowerCase()
        })

        return res.status(200).json({
            msg: "Pendiente de activación para su cuenta",
            userData
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        })
    }
}