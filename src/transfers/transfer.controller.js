import { response, request } from "express"
import Transfer from "./Transfer.model.js"
import User from "../users/user.model.js"
import jwt from "jsonwebtoken"
import nodemailer from 'nodemailer'

export const addTransfer = async (req, res)=>{
    try {
        const token = await req.header('x-token')

        if(!token){
            return res.status(401).json({
                msg: 'Token not found.'
            })
        }

        const {accountNumberAddresser, amount, motive} = req.body
        let newAmount = amount.toFixed(2)
        console.log(newAmount)
        const { uid } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
        const senderUser = await User.findById(uid)
        const addresserUser = await User.findOne({accountNumber: accountNumberAddresser})
        const date = new Date()
        const dateToIzo = date.toISOString()
        const currentDate = dateToIzo.replace('Z', '+00:00')

        const transferences = await Transfer.find({senderRef: senderUser.id, verificationEmail: true, verification:true})
        let currentTransferences = []
        transferences.map(localTransfer =>{
            let listData = localTransfer.date.slice(0, 10);
            let currDate = currentDate.slice(0, 10);
            if(listData == currDate){
                currentTransferences.push(localTransfer)
            }
        })
        let sum = 0
        currentTransferences.map(localTransference=>{
            sum = sum + localTransference.amount
        })
        console.log(sum)
        if(senderUser.role == "ADMIN"){
            return res.status(401).json({
                msg: 'You must be an user to use this.'
            })
        }
        if(addresserUser.role == "ADMIN"){
            return res.status(401).json({
                msg: 'You are trying to transfer to an admin.'
            })
        }

        if(amount > 2000){
            return res.status(401).json({
                msg: 'You exceeded the limit per transaction (2000 GTQ)'
            })
        }

        if(senderUser.income == 0){
            return res.status(400).json({
                success: false,
                message: "You dont have any balance.",
            })
        }

        if(( senderUser.income - parseFloat(amount)) < 0){
            return res.status(400).json({
                success: false,
                message: "Amount overcame your balance.",
            })
        }

        const transfer = await Transfer.create({ 
            senderName: senderUser.name,
            addresserName: addresserUser.name,
            senderRef: senderUser.id,
            addresserRef: addresserUser.id,
            amount: newAmount,
            senderNumber: senderUser.accountNumber,
            addresserNumber: addresserUser.accountNumber,
            motive,
            date: currentDate
        })

        const tokenEmail = jwt.sign(
            {
              email: senderUser.email,
              number: accountNumberAddresser,
              amount: newAmount,
              transferId : transfer.id,
              userId: senderUser.id
            },
            process.env.SECRETOPRIVATEKEY,
            {
              expiresIn: "1.5m"
            }
          )
          const { transferId } = jwt.verify(tokenEmail, process.env.SECRETOPRIVATEKEY)
          console.log(transferId)

        const denyLink = `http://localhost:3000/Valmeria_App/V1/transfers/deny?tokenEmail=${tokenEmail}`
        
        const completeLink = `http://localhost:3000/Valmeria_App/V1/transfers/complete?tokenEmail=${tokenEmail}`

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

        await transporter.sendMail({
            from: 'no-reply@valmeria_app.com',
            to: senderUser.email,
            subject: `Transferencia: ${newAmount} ${senderUser.divisas} a ${addresserUser.accountNumber}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
                <h2 style="color: #333333; text-align: center; margin-bottom: 20px;">Completa la Transferencia Por Favor</h2>
                <p style="text-align: center; color: #555555; margin-bottom: 20px;">Completa tu transferencia acá.</p>
                <p style="text-align: center; color: #555555; margin-bottom: 20px;">Verifica los datos antes de darle click al botón azul.</p>
                    
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    
                <h3 style="color: #333333; text-align: center; margin-bottom: 15px;">Tu información:</h3>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p style="margin: 5px 0; color: #555555;"><strong>Nombre completo:</strong> ${senderUser.name}</p>
                    <p style="margin: 5px 0; color: #555555;"><strong>Número de cuenta:</strong> ${senderUser.accountNumber}</p>
                    <p style="margin: 5px 0; color: #555555;"><strong>Correo:</strong> ${senderUser.email}</p>
                </div>
                    
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    
                <h3 style="color: #333333; text-align: center; margin-bottom: 15px;">Usuario a transferir:</h3>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p style="margin: 5px 0; color: #555555;"><strong>Nombre completo:</strong> ${addresserUser.name}</p>
                    <p style="margin: 5px 0; color: #555555;"><strong>Número de cuenta:</strong> ${addresserUser.accountNumber}</p>
                    <p style="margin: 5px 0; color: #555555;"><strong>Correo:</strong> ${addresserUser.email}</p>
                    <p style="margin: 5px 0; color: #555555;"><strong>Monto a transferir:</strong> ${newAmount} ${senderUser.divisas}</p>
                </div>
                    
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    
                <div style="text-align: center; margin-bottom: 10 px;">
                    <a href="${completeLink}" target="_blank" style="display: inline-block; padding: 12px 25px; background-color: #0082ec; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-bottom: 10px;">Completar Transferencia</a>
                </div>
                    
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    
                <p style="text-align: center; color: #555555; margin-bottom: 20px;">Si no has sido tú, presiona el siguiente botón para denegar la transferencia.</p>
                    
                <div style="text-align: center; margin-bottom: 20px;">
                    <a href="${denyLink}" target="_blank" style="display: inline-block; padding: 12px 25px; background-color: #e11c1c; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Denegar</a>
                </div>
                    
                <p style="text-align: center; color: #999999; font-size: 12px;">Este enlace expirará en 1:30 minutos.</p>
            </div>
            ` 
        })

        return res.status(200).json({
            success: true,
            message: "Transfer Successfully made.",
            transfer,

        })
        
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Transfer creation failed",
            error: e.message
        })
    }
}

export const completeTransfer = async (req, res)=>{
    try {
        const token = req.query.tokenEmail;
    
        if(!token){
            return res.status(401).json({
                msg: 'Token not found.'
            })
        }

        const { email, number, amount, transferId, userId } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
        const senderUser = await User.findOne({email})
        const addresserUser = await User.findOne({accountNumber:number})
        const date = new Date()
        const dateToIzo = date.toISOString()
        const currentDate = dateToIzo.replace('Z', '+00:00')
        const currentTransfer = await Transfer.findById(transferId)

        if(currentTransfer.verification == true){
            return res.status(200).json({
                success: true,
                message: "Transference already denied."
            })
        }
        const transfer = await Transfer.findByIdAndUpdate(transferId,{
            date: currentDate,
            verification: true,
            verificationEmail: true
        })

        await User.findByIdAndUpdate(
            senderUser.id,
            {
                income: senderUser.income - parseFloat(amount)
            },
            {new:true}
        )

        await User.findByIdAndUpdate(
            addresserUser.id,
            {
                income: addresserUser.income + parseFloat(amount)
            },
            {new:true}
        )

        return res.status(200).json({
            success: true,
            message: "Transfer Successfully made.",
            transfer
        })
        
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Transfer creation failed",
            error: e.message
        })
    }
}

export const denyTransfer = async (req, res)=>{
    try {
        const token = req.query.tokenEmail;
    
        if(!token){
            return res.status(401).json({
                msg: 'Token not found.'
            })
        }

        const { transferId } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
        const transfer = await Transfer.findByIdAndUpdate(transferId,{
            verification: true
        })

        return res.status(200).json({
            success: true,
            message: "Transfer Successfully denied.",
            transfer
        })
        
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Transfer creation failed",
            error: e.message
        })
    }
}

export const getTransferencesByUser = async (req, res = response)=>{
    try {
        const token = await req.header('x-token')

        if(!token){
            return res.status(401).json({
                msg: 'Token not found.'
            })
        }

        const { uid } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
        const { id } = req.params

        const currentUser = await User.findById(uid)

        if(currentUser.role == "USER"){
            return res.status(401).json({
                msg: 'You must be an admin to use this.'
            })
        }

        const transferences = await Transfer.find({senderRef: id, verificationEmail: true, verification:true})
            .skip(0)
            .limit(5)
        return res.status(200).json({
            success: true,
            message: "Transferences found successfully.",
            transferences
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Transferences not found.",
            error: e.message
        })
    }
}

export const getTransferences = async (req, res = response)=>{
    try {
        const token = await req.header('x-token')

        if(!token){
            return res.status(401).json({
                msg: 'Token not found.'
            })
        }
        const { uid } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)

        const currentUser = await User.findById(uid)

        if(currentUser.role == "ADMIN"){
            return res.status(401).json({
                msg: 'You must be an user to use this.'
            })
        }
        let transferencesUser = []
        const transferences = await Transfer.find({senderRef: uid, verificationEmail: true, verification:true})
        transferences.map(localTransference =>{
            let { senderName, senderRef, senderNumber, ...data } = localTransference._doc
            transferencesUser.push(data)
        })
        return res.status(200).json({
            success: true,
            message: "Transferences found successfully.",
            transferencesUser
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: "Transferences not found.",
            error: e.message
        })
    }
}

