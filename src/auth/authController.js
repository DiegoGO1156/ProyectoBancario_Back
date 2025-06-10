import { generarJWT } from "../helpers/generateJWT.js"
import User from "../users/user.model.js"
import { hash, verify } from "argon2"
import { validateDPI } from "../middlewares/validateDPI.js"
import { validatePassword } from "../middlewares/validatorPasswords.js"
import jwt from "jsonwebtoken"
import nodemailer from 'nodemailer'
export const login = async(req, res) =>{
    try {
        
        const {email, username, password} = req.body

        const lowerEmail = email ? email.toLowerCase() : null

        const findUser = await User.findOne({
            $or: [{email: lowerEmail}, {username: username}]
        })
        const validPass = await verify(findUser.password, password)
        console.log('hola')

        if(findUser.verification != true){
            return res.status(401).json({
                success:false,
                msg: "Falta validar la cuenta."
            })
        }

        if(!validPass){
            return res.status(401).json({
                success:false,
                msg: "Contraseña incorrecta"
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
        let userData
        const userExist = await User.findOne({email: data.email.toLowerCase()})
        console.log(!userExist)
        if(!userExist){
            userData = await User.create({
                ...data,
                accountNumber: newAccountNumber,
                password: encryptPass,
                username: data.username.toLowerCase(),
                email: data.email.toLowerCase()
            })
        }

        const token = jwt.sign({ email: data.email.toLowerCase()}, process.env.SECRETOPRIVATEKEY, {
            expiresIn: "1.5m"
        })

        const verificationLink = `http://localhost:3000/Valmeria_App/V1/Auth/verify?token=${token}`

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            },
            tls: {
              rejectUnauthorized: false
            }
        })

        const verifyUser = await User.findOne({email: data.email.toLowerCase(), verification: false})
        if(verifyUser){
            await transporter.sendMail({
                from: 'no-reply@valmeria_app.com',
                to: data.email.toLowerCase(),
                subject: 'Verify your account',
                html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                <h2>¡Bienvenido a Valmeria App!</h2>
                <p>Gracias por registrarte. Solo necesitas verificar tu correo para comenzar.</p>
                <p>Después de haber verificado tu correo, un administrador aceptará tu solicitud de registro. Paciencia por favor.</p>
                <br/>
                <a href="${verificationLink}" target="_blank" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Verificar correo</a>
                <br/>
                <br/>
                <p>Este enlace expirará en 1:30 minutos.</p>
                <br>
                <p>Si tú no creaste esta cuenta, puedes ignorar este mensaje.</p>
                </div>
                `
            });
        } else{
            return res.status(400).json({
                msg: "Cuenta ya registrada.",
                userData
            })
        }

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

        if(!token){
            return res.status(401).json({
                msg: 'Token not found.'
            })
        }

        const { email } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ msg: "User not found." })
        }

        user.verification = true
        await user.save()

        return res.status(200).json({
            msg: "Email successfully verified."
        });
    } catch (e) {
        return res.status(400).json({
            msg: "Invalid or expired token.",
            error: e.message
        })
    }
}