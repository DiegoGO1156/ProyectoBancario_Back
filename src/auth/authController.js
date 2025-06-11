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
    } catch (e) {
        res.send(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Error de Verificación | Valmeria</title>
              <style>
                :root {
                  --error: #f44336;
                  --error-dark: #d32f2f;
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

                .error-icon {
                  font-size: 60px;
                  color: var(--error);
                  margin-bottom: 20px;
                }

                h1 {
                  color: var(--error);
                  margin-bottom: 15px;
                  font-size: 28px;
                }

                p {
                  color: var(--text);
                  margin-bottom: 25px;
                  line-height: 1.6;
                }

                .btn {
                  display: inline-block;
                  padding: 12px 30px;
                  background: var(--error);
                  color: white;
                  text-decoration: none;
                  border-radius: 30px;
                  font-weight: 600;
                  transition: all 0.3s ease;
                  margin: 5px;
                }

                .btn:hover {
                  background: var(--error-dark);
                  transform: translateY(-2px);
                  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
                }

                .btn-secondary {
                  background: #555;
                }

                .btn-secondary:hover {
                  background: #333;
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                }

                .action-group {
                  display: flex;
                  gap: 10px;
                  justify-content: center;
                  flex-wrap: wrap;
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
                <h1>Error de Verificación</h1>
                <p>El enlace de verificación ha expirado.</p>
                <p>Los enlaces de verificación caducan después de 1:30 minutos por seguridad.</p>

                <div class="footer">
                  <p>¿Sigues teniendo problemas? Envíanos un correo a valmeriaapp@gmail.com</p>
                </div>
              </div>
            </body>
            </html>
            `);
    }
}