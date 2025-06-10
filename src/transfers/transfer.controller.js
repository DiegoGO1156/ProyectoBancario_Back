import { response, request } from "express"
import Transfer from "./Transfer.model.js"
import User from "../users/user.model.js"
import jwt from "jsonwebtoken"
import nodemailer from 'nodemailer'

// export const getHotels = async  (req = request, res = response) => {
//     try {
//         const {limit = 10, since = 0} = req.query
//         const query = {state : true}

//         const [total, hotels] = await Promise.all([
//             Hotel.countDocuments(query),
//             Hotel.find(query)
//                 .skip(Number(since))
//                 .limit(Number(limit))
//         ])
        
//         res.status(200).json({
//             succes: true,
//             total,
//             hotels
//         })

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             msg:'Error obtaining hotels',
//             error
//         })
//     }
// }

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
        console.log(addresserUser)

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
              transferId : transfer.id
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
            subject: 'Completa la transferencia.',
            html: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
            <h2>Completa la Transferencia Por Favor</h2>
            <p>Completa tu transferencia acá.</p>
            <br/>
            <p>Verifica los datos antes de darle click al botón azul.</p>
            <br/>
            <p>Usuario a transferir:</p>
            <br/>
            <p>Nombre completo: ${addresserUser.name}</p>
            <br/>
            <p>Número de cuenta: ${addresserUser.accountNumber}</p>
            <br/>
            <p>Correo: ${addresserUser.email}</p>
            <br/>
            <p>Monto a transferir: ${newAmount} ${senderUser.divisas}</p>
            <br/>
            <a href="${completeLink}" style="padding: 10px 20px; background-color:rgb(0, 130, 236); color: white; text-decoration: none; border-radius: 5px;">Completar Transferencia</a>
            <br/>
            <br/>
            <p>Si no has sido tu, presina el siguiente link, "Denegar".</p>
            <br/>
            <a href="${denyLink}" style="padding: 10px 20px; background-color:rgb(225, 28, 28); color: white; text-decoration: none; border-radius: 5px;">Denegar</a>
            <br/>
            <br/>
            <p>Este enlace expirará en 1:30 minutos.</p>
            <br>
            </div>
            ` 
        })

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

export const completeTransfer = async (req, res)=>{
    try {
        const token = req.query.tokenEmail;
    
        if(!token){
            return res.status(401).json({
                msg: 'Token not found.'
            })
        }

        const { email, number, amount, transferId } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
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

// export const updateHotel = async (req, res = response)=>{
//     try {
//         //const token = await req.header('x-token')

//         // if(!token){
//         //     return res.status(401).json({
//         //         msg: 'No hay token en la peticion'
//         //     })
//         // }

//         //const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

//         const data = req.body
//         const { id } = req.params

//         // if(user.role == "ADMIN_ROLE" || user.role == "OWNER_ROLE"){
    
//         const hotel = await Hotel.findByIdAndUpdate(id, { 
//             name: data.name,
//             address: data.address,
//             category: data.category,
//             roomsAvailable: data.roomsAvailable,
//             amenities: data.amenities,
//             priceEvent: data.priceEvent
//         } , {new:true})
//         return res.status(200).json({
//             success: true,
//             message: "Hotel updated successfully",
//             hotel
//         })
//         // } else{
//         //     return res.status(401).json({
//         //         success: false,
//         //         message: "You are not allowed to do this."
//         //     })
//         // }
//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({
//             message: "Hotel update failed",
//             error: e.message
//         })
//     }
// }

// export const getHotelById = async (req, res = response)=>{
//     try {
//         const { id } = req.params
    
//         const hotel = await Hotel.findById(id)
//         return res.status(200).json({
//             success: true,
//             message: "Hotel found",
//             hotel
//         })
//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({
//             message: "Hotel not found",
//             error: e.message
//         })
//     }
// }

// export const deleteHotel = async (req, res = response)=>{
//     try {
//         //const token = await req.header('x-token')

//         // if(!token){
//         //     return res.status(401).json({
//         //         msg: 'No hay token en la peticion'
//         //     })
//         // }

//         //const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY)

//         const data = req.body
//         const { id } = req.params

//         // if(user.role == "ADMIN_ROLE" || user.role == "OWNER_ROLE"){
    
//         const hotel = await Hotel.findByIdAndUpdate(id, { 
//             state:false
//         } , {new:true})
//         return res.status(200).json({
//             success: true,
//             message: "Hotel deleted successfully",
//             hotel
//         })
//         // } else{
//         //     return res.status(401).json({
//         //         success: false,
//         //         message: "You are not allowed to do this."
//         //     })
//         // }
//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({
//             message: "Hotel deletion failed",
//             error: e.message
//         })
//     }
// }

// export const getHotelByName = async (req, res) => {
//   try {
//     const { name } = req.params;

//     const hotel = await Hotel.findOne({ name });
//     if (!hotel) {
//       return res.status(404).json({ message: "Hotel not found" });
//     }

//     const rooms = await Room.find({ hotel: hotel._id });

//     return res.status(200).json({
//       success: true,
//       message: "Hotel and rooms found",
//       hotel,
//       rooms,
//     });
//   } catch (e) {
//     console.log(e);
//     return res.status(500).json({
//       message: "Error fetching hotel",
//       error: e.message,
//     });
//   }
// };
