import { body } from "express-validator";
import { validarCampos } from "./validarCampos.js"
import { emailUsed, minincome, pendingAccount, usedUsername } from "../helpers/db-Validator.js";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer'
import User from "../users/user.model.js";

export const registerValidator =[
    body("name", "The name is required").not().isEmpty(),
    body("username", "The username is required").not().isEmpty(),
    body("username").custom(usedUsername),
    body("dpi", "The DPI is required").not().isEmpty(),
    body("address", "The address is required").not().isEmpty(),
    body("phone", "The phone is required").not().isEmpty(),
    body("email", "The email is required").not().isEmpty(),
    body("email").custom(emailUsed),
    body("password", "The password is required").notEmpty().isLength({min: 8}).withMessage("The minimum number of characters in the password must be 8"),
    body("companyName", "The company Name is required").not().isEmpty(),
    body("income", "The income is required").notEmpty(),
    body("income", "The income is required").custom(minincome),
    validarCampos
]

export const loginValidator = [
    body("email").optional().isEmail().withMessage("Ingresa una direccion de correo valida"),
    body("email").optional().custom(pendingAccount),
    body("username").optional().isString().withMessage("Ingrese un username valido"),
    body("password", "The password must have at least 8 characters").isLength({min:8}),
    validarCampos
]

export const validateLogin = async (req, res, findUser, validPass) => {
  if(findUser.verification != true){
    return res.status(401).json({
        success:false,
        msg: "Falta validar la cuenta."
    })
  }

  if(findUser.statusAccount == 'Pending'){
    return res.status(401).json({
        success:false,
        msg: "Cuenta aún no validada por administrador."
    })
  }

  if(!validPass){
    return res.status(401).json({
        success:false,
        msg: "Incorrect password"
    })
  }
}
export const validateRegister = async (req, res, userData) => {
    const {accountNumber, ...data} = req.body
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
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
                <h2 style="color: #333333; text-align: center; margin-bottom: 20px;">¡Bienvenido a Valmeria App!</h2>
                <p style="text-align: center; color: #555555; margin-bottom: 15px;">Gracias por registrarte. Solo necesitas verificar tu correo para comenzar.</p>
                <p style="text-align: center; color: #555555; margin-bottom: 20px;">Después de haber verificado tu correo, un administrador aceptará tu solicitud de registro. Paciencia por favor.</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 12px 25px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Verificar correo</a>
                </div>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="text-align: center; color: #999999; font-size: 12px; margin-bottom: 15px;">Este enlace expirará en 1:30 minutos.</p>
                <p style="text-align: center; color: #999999; font-size: 12px;">Si tú no creaste esta cuenta, puedes ignorar este mensaje.</p>
            </div>
            `
        });
    } else{
        res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cuenta Existente | Valmeria</title>
        <style>
          :root {
            --primary: #2196F3;
            --secondary: #1565C0;
            --error: #f44336;
            --text: #333;
            --light-bg: #f9f9f9;
          }
        
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
        
          body {
            background-color: var(--light-bg);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }
        
          .verification-card {
            background: white;
            max-width: 500px;
            width: 100%;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            text-align: center;
          }
        
          .logo {
            width: 120px;
            margin-bottom: 20px;
          }
        
          h1 {
            color: var(--primary);
            margin-bottom: 15px;
            font-size: 28px;
          }
        
          p {
            color: var(--text);
            margin-bottom: 25px;
            line-height: 1.6;
          }
        
          .info-icon {
            font-size: 60px;
            color: var(--primary);
            margin-bottom: 20px;
          }
        
          .btn {
            display: inline-block;
            padding: 12px 30px;
            background: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            transition: all 0.3s ease;
            margin-top: 10px;
          }
        
          .btn:hover {
            background: var(--secondary);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
          }
        
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="verification-card">
          <div class="info-icon">ℹ️</div>
          <h1>Cuenta ya existente</h1>
          <p>El correo <strong>${email}</strong> ya está asociado a una cuenta en Valmeria.</p>
          <p>Si olvidaste tu contraseña, puedes restablecerla usando el enlace a continuación.</p>
          <a href="${process.env.FRONTEND_URL}/forgot-password" class="btn">Recuperar Contraseña</a>
          <div class="footer">
            <p>Si crees que esto es un error, por favor contacta a valmeriaapp@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `);
    }
}

export const validateVerifyEmail = async (req, res, user, token) => {
    const { email } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
    if (!user) {
        return res.status(404).json({ msg: "User not found." })
    }
    const currentUser = await User.findOne({email})
    await User.findByIdAndUpdate(currentUser.id, {verification:true}, {new:true})
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificación Exitosa | Valmeria</title>
        <style>
          :root {
            --primary: #4CAF50;
            --secondary: #2E7D32;
            --error: #f44336;
            --text: #333;
            --light-bg: #f9f9f9;
          }
        
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          }
        
          body {
            background-color: var(--light-bg);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
          }
        
          .verification-card {
            background: white;
            max-width: 500px;
            width: 100%;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            text-align: center;
          }
        
          .logo {
            width: 120px;
            margin-bottom: 20px;
          }
        
          h1 {
            color: var(--primary);
            margin-bottom: 15px;
            font-size: 28px;
          }
        
          p {
            color: var(--text);
            margin-bottom: 25px;
            line-height: 1.6;
          }
        
          .success-icon {
            font-size: 60px;
            color: var(--primary);
            margin-bottom: 20px;
          }
        
          .btn {
            display: inline-block;
            padding: 12px 30px;
            background: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 30px;
            font-weight: 600;
            transition: all 0.3s ease;
            margin-top: 10px;
          }
        
          .btn:hover {
            background: var(--secondary);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
          }
        
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="verification-card">
          <h1>¡Verificación Exitosa!</h1>
          <p>Tu correo <strong>${email}</strong> ha sido verificado correctamente.</p>
          <p>Ahora puedes acceder a todas las funciones de tu cuenta Valmeria.</p>
          <a href="${process.env.FRONTEND_URL}/login" class="btn">Iniciar Sesión</a>
          <div class="footer">
            <p>Si no realizaste esta acción, por favor contacta a valmeriaapp@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `);
}
