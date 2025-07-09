import { response, request } from "express"
import Transfer from "./Transfer.model.js"
import User from "../users/user.model.js"
import jwt from "jsonwebtoken"
import { validateEmailToken, validateEmailTokenVerify, validateExpiredToken, validateToken } from "../middlewares/validateCommonStuff.js"
import { 
  validateAddPaymentServiceEmail,
  validateAddProductPurchaseEmail,
  validateAddTransfers, 
  validateAddTransfersEmail, 
  validateBuyProduct, 
  validateCompletePayment, 
  validateCompletePurchase, 
  validateCompleteTransfer, 
  validateDenyPayment, 
  validateDenyPurchase, 
  validateGetTransferences, 
  validateListUserTransfered, 
  validateMakeAUserFavorite, 
  validatePayService, 
  valodateDenyTransfer,
  valodateGetTransferencesByUser
} from "../middlewares/validateTransfers.js"
import Product from "../products/product.model.js"
import Service from "../services/service.model.js"

export const addTransfer = async (req, res)=>{
    try {
        const token = await req.header('Authorization')

        await validateToken(req, res)
          if(res.headersSent) return

        const {accountNumberAddresser, amount, motive} = req.body
        let newAmount = amount.toFixed(2)
        const { uid } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
        const senderUser = await User.findById(uid)
        const addresserUser = await User.findOne({accountNumber: accountNumberAddresser, statusAccount:"Active", verification: true})
        const date = new Date()
        const dateToIzo = date.toISOString()
        const currentDate = dateToIzo.replace('Z', '+00:00')

        await validateAddTransfers(req, res, currentDate, senderUser, addresserUser)
          if(res.headersSent) return

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

        await validateAddTransfersEmail(req, res, senderUser, addresserUser,newAmount, transfer)
          if(res.headersSent) return

        setTimeout(() => deleteUselessTransferences(transfer.id), 90_000)

        return res.status(200).json({
            success: true,
            message: "Transfer Successfully made.",
            transfer,

        })
        
    } catch (e) {
        return res.status(500).json({
            message: "Transfer creation failed",
            error: e.message
        })
    }
}

export const buyProduct = async (req, res)=>{
    try {
      const token = await req.header('Authorization')
      
      await validateToken(req, res)
      if(res.headersSent) return

      const {id} = req.params
      const { uid } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
      const senderUser = await User.findById(uid)
      const product = await Product.findById(id)
      
      const date = new Date()
      const dateToIzo = date.toISOString()
      const currentDate = dateToIzo.replace('Z', '+00:00')
      
      await validateBuyProduct(req, res, senderUser, product)
        if(res.headersSent) return
      
      const transfer = await Transfer.create({ 
        senderName: senderUser.name,
        productName: product.nameProduct,
        senderRef: senderUser.id,
        productRef: product.id,
        amount: product.price,
        senderNumber: senderUser.accountNumber,
        motive: `Purchase of the following product: ${product.nameProduct}, with price: ${product.price}, with id: ${product.id}`,
        date: currentDate
      })

      setTimeout(() => deleteUselessTransferences(transfer.id), 90_000)

      await validateAddProductPurchaseEmail(req, res, senderUser, product, transfer)
        if(res.headersSent) return
      return res.status(200).json({
          success: true,
          message: "Product successfully purchased.",
          transfer,
      })
        
    } catch (e) {
        return res.status(500).json({
            message: "Transfer creation failed",
            error: e.message
        })
    }
}

export const payService = async (req, res)=>{
    try {
      const token = await req.header('Authorization')
      
      await validateToken(req, res)
      if(res.headersSent) return

      const { amount } = req.body || {}

      const {id} = req.params
      const { uid } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
      const senderUser = await User.findById(uid)
      const service = await Service.findById(id)
      
      const date = new Date()
      const dateToIzo = date.toISOString()
      const currentDate = dateToIzo.replace('Z', '+00:00')
      
      await validatePayService(req, res, senderUser, service, amount)
        if(res.headersSent) return
      let newAmount = 0
      if(service.exclusive){
        newAmount = service.price
      } else{
        newAmount = amount
      }
      
      const transfer = await Transfer.create({ 
        senderName: senderUser.name,
        serviceName: service.nameProduct,
        senderRef: senderUser.id,
        serviceRef: service.id,
        amount: newAmount,
        senderNumber: senderUser.accountNumber,
        motive: `Payment of the following service: ${service.nameService}, with price: ${service.price}, with id: ${service.id}`,
        date: currentDate
      })

      setTimeout(() => deleteUselessTransferences(transfer.id), 90_000)

      await validateAddPaymentServiceEmail(req, res, senderUser, service, transfer, newAmount)
        if(res.headersSent) return
      return res.status(200).json({
          success: true,
          message: "Product successfully purchased.",
          transfer,
      })
        
    } catch (e) {
        return res.status(500).json({
            message: "Transfer creation failed",
            error: e.message
        })
    }
}

export const makeAUserFavorite = async (req, res)=>{
  try {
    const token = await req.header('Authorization')

    await validateToken(req, res)
          if(res.headersSent) return

    const { uid } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)

    const senderUser = await User.findById(uid)

    let userList = senderUser.userList

    await validateMakeAUserFavorite(req, res, senderUser, userList)
          if(res.headersSent) return
          
  } catch (e) {
    return res.status(500).json({
        message: "It couldnt turn favorite",
        error: e.message
    })
  }
}

export const listUserTransfered = async (req, res)=>{
  try {
    const token = await req.header('Authorization')

    await validateToken(req, res)
          if(res.headersSent) return

    const { uid } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)

    const senderUser = await User.findById(uid)

    await validateListUserTransfered(req, res, senderUser)
          if(res.headersSent) return
  } catch (e) {
    return res.status(500).json({
        message: "Users not found",
        error: e.message
    })
  }
}

export const completeTransfer = async (req, res)=>{
    try {
        const token = req.query.tokenEmail;
    
        await validateEmailTokenVerify(req, res)
          if(res.headersSent) return

        const { email, number } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
        const senderUser = await User.findOne({email})
        const addresserUser = await User.findOne({accountNumber:number})
        const date = new Date()
        const dateToIzo = date.toISOString()
        const currentDate = dateToIzo.replace('Z', '+00:00')

        await validateCompleteTransfer(req, res, senderUser, addresserUser, currentDate)
          if(res.headersSent) return
        
    } catch (e) {
        console.log(e)
        await validateExpiredToken(req, res)
          if(res.headersSent) return
    }
}

export const completePurchase = async (req, res)=>{
    try {
        const token = req.query.tokenEmail;
    
        await validateEmailTokenVerify(req, res)
          if(res.headersSent) return

        const { email, number } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
        const senderUser = await User.findOne({email})
        const product = await Product.findById(number)
        const date = new Date()
        const dateToIzo = date.toISOString()
        const currentDate = dateToIzo.replace('Z', '+00:00')

        await validateCompletePurchase(req, res, senderUser, product, currentDate)
          if(res.headersSent) return
        
    } catch (e) {
        console.log(e)
        await validateExpiredToken(req, res)
          if(res.headersSent) return
    }
}

export const completePayService = async (req, res)=>{
    try {
        const token = req.query.tokenEmail;
    
        await validateEmailTokenVerify(req, res)
          if(res.headersSent) return

        const { email, number } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
        const senderUser = await User.findOne({email})
        const service = await Service.findById(number)
        const date = new Date()
        const dateToIzo = date.toISOString()
        const currentDate = dateToIzo.replace('Z', '+00:00')
        await validateCompletePayment(req, res, senderUser, service, currentDate)
          if(res.headersSent) return
        
    } catch (e) {
        console.log(e)
        await validateExpiredToken(req, res)
          if(res.headersSent) return
    }
}

export const denyTransfer = async (req, res)=>{
    try {
        const token = req.query.tokenEmail;
    
        await validateEmailTokenVerify(req, res)
          if(res.headersSent) return

        const { email, number, amount, transferId, userId } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
        const senderUser = await User.findOne({email})
        const addresserUser = await User.findOne({accountNumber:number})
        
        await Transfer.findByIdAndUpdate(transferId,{
            verification: true
        })

        await valodateDenyTransfer(req, res, senderUser, addresserUser, token)
          if(res.headersSent) return
    } catch (e) {
        console.log(e)
        await validateExpiredToken(req, res)
          if(res.headersSent) return
    }
}

export const denyPurchase = async (req, res)=>{
    try {
        const token = req.query.tokenEmail;
    
        await validateEmailTokenVerify(req, res)
          if(res.headersSent) return

        const { email, number, transferId } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
        const senderUser = await User.findOne({email})
        const product = await Product.findById(number)
        
        await Transfer.findByIdAndUpdate(transferId,{
            verification: true
        })

        await validateDenyPurchase(req, res, senderUser, product, token)
          if(res.headersSent) return
    } catch (e) {
        console.log(e)
        await validateExpiredToken(req, res)
          if(res.headersSent) return
    }
}

export const denyPayment = async (req, res)=>{
    try {
        const token = req.query.tokenEmail;
    
        await validateEmailTokenVerify(req, res)
          if(res.headersSent) return

        const { email, number, transferId } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
        const senderUser = await User.findOne({email})
        const service = await Service.findById(number)
        
        await Transfer.findByIdAndUpdate(transferId,{
            verification: true
        })

        await validateDenyPayment(req, res, senderUser, service, token)
          if(res.headersSent) return
    } catch (e) {
        console.log(e)
        await validateExpiredToken(req, res)
          if(res.headersSent) return
    }
}


export const getTransferencesByUser = async (req, res = response)=>{
    try {
        const token = await req.header('Authorization')

        await validateToken(req, res)
          if(res.headersSent) return

        const { uid } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
        const { id } = req.params

        const currentUser = await User.findById(uid)

        await valodateGetTransferencesByUser(req, res, currentUser)
          if(res.headersSent) return

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
        const token = await req.header('Authorization')

        await validateToken(req, res)
          if(res.headersSent) return

        const { uid } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)

        const currentUser = await User.findById(uid)

        await validateGetTransferences(req, res, currentUser)
          if(res.headersSent) return

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

const deleteUselessTransferences = async (id) =>{
  const transfer = await Transfer.findById(id)
  if(transfer.verification == false){
    await Transfer.findByIdAndDelete(id)
    console.log('Transference deleted successfully, ' + id)
  } else{
    console.log('Transference made successfully, ' + id)
  }
}