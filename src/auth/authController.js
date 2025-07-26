
import { generarJWT } from "../helpers/generateJWT.js";
import User from "../users/user.model.js";
import { hash, verify } from "argon2";
import { validateDPI } from "../middlewares/validateDPI.js";
import { validatePassword } from "../middlewares/validatorPasswords.js";
import jwt from "jsonwebtoken"
import { validateEmailToken, validateExpiredToken, validateToken } from "../middlewares/validateCommonStuff.js"
import { validateLogin, validateRegister, validateVerifyEmail } from "../middlewares/validatorAuth.js"

export const login = async(req, res) =>{
    try {
        
        const {email, username, password} = req.body

        const lowerEmail = email ? email.toLowerCase() : null

        const findUser = await User.findOne({
            $or: [{email: lowerEmail}, {username: username}]
        })
        const validPass = await verify(findUser.password, password)

        await validateLogin(req, res, findUser, validPass)
          if(res.headersSent) return

        const token = await generarJWT(findUser.id)

        return res.status(200).json({
            userDetails:{
                _id: findUser._id,
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

        const verifyUsername = await User.findOne({username: data.username.toLowerCase(), verification:true})
        const verifyEmail = await User.findOne({email: data.email.toLowerCase(), verification:true})
        let userData

        if(verifyEmail){
            return res.status(400).json({
                msg: "Cuenta ya registrada.",
                userData
            })
        }
        
        if(verifyUsername){
            return res.status(400).json({
                msg: "Cuenta ya registrada.",
                userData
            })
        }
        
        if(!verifyEmail){
            userData = await User.create({
                ...data,
                accountNumber: newAccountNumber,
                password: encryptPass,
                username: data.username.toLowerCase(),
                email: data.email.toLowerCase(),
                userList:[]
            })
        } 

        if(verifyEmail){
            userData = await User.create({
                ...data,
                accountNumber: newAccountNumber,
                password: encryptPass,
                username: data.username.toLowerCase(),
                email: data.email.toLowerCase(),
                userList:[]
            })
        } else{
            
        }

        await validateRegister(req, res, userData)
          if(res.headersSent) return
          
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

export const verifyEmail = async (req, res) => {
    try {
        const token = req.query.token;
        console.log('hoLAAA')

        await validateEmailToken(req, res)
          if(res.headersSent) return

        const { email } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)

        const user = await User.findOne({ email })

        await validateVerifyEmail(req, res, user, token)
          if(res.headersSent) return

        user.verification = true
        await user.save()
    } catch (e) {
      console.log(e)
      await validateExpiredToken(req, res)
        if(res.headersSent) return
    }
}