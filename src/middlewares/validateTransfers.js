import Transfer from "../transfers/transfer.model.js"
import jwt from "jsonwebtoken"
import nodemailer from 'nodemailer'
import User from "../users/user.model.js"

export const validateAddTransfers = async (req, res, currentDate, senderUser, addresserUser) => {
    
    const { amount } = req.body

    const transferences = await Transfer.find({senderRef: senderUser.id, verificationEmail: true, verification:true})
    let currentTransferences = []
    transferences.map(async localTransfer =>{
      let verifyTransfer = await Transfer.findOne({addresserName: localTransfer.addresserName})
      if(verifyTransfer){
        let listData = localTransfer.date.slice(0, 10);
        let currDate = currentDate.slice(0, 10);
        if(listData == currDate){
            currentTransferences.push(localTransfer)
        }
      }
    })
    if(!addresserUser){
        return res.status(401).json({
            msg: 'The addresser doesnt exist.'
        })
    }
    let sum = 0
    currentTransferences.map(localTransference=>{
        sum = sum + localTransference.amount
    })

    if(sum+amount > 10000){
        return res.status(401).json({
            msg: 'You cant do more transferences, try again tomorrow.'
        })
    }

    if(senderUser.accountNumber == addresserUser.accountNumber){
        return res.status(401).json({
            msg: 'You cant transfer to yourself.'
        })
    }
    if(parseInt(amount) <= 0){
        return res.status(401).json({
            msg: 'Add a valid amount, (more than 0)'
        })
    }
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
}

export const validateAddTransfersEmail = async (req, res, senderUser, addresserUser,newAmount, transfer) => {
    const {accountNumberAddresser, alias} = req.body
    const tokenEmail = jwt.sign(
      {
        email: senderUser.email,
        number: accountNumberAddresser,
        amount: newAmount,
        transferId : transfer.id,
        userId: senderUser.id,
        alias
      },
      process.env.SECRETOPRIVATEKEY,
      {
        expiresIn: "1.5m"
      }
    )
    const denyLink = `https://proyectobancario-back.onrender.com/Valmeria_App/V1/transfers/deny?tokenEmail=${tokenEmail}`
    
    const completeLink = `https://proyectobancario-back.onrender.com/Valmeria_App/V1/transfers/complete?tokenEmail=${tokenEmail}`

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
}

export const validateAddProductPurchaseEmail = async (req, res, senderUser, product, transfer) => {
    const tokenEmail = jwt.sign(
      {
        email: senderUser.email,
        number: product.id,
        amount: product.price,
        transferId : transfer.id,
        userId: senderUser.id
      },
      process.env.SECRETOPRIVATEKEY,
      {
        expiresIn: "1.5m"
      }
    )
    const denyLink = `https://proyectobancario-back.onrender.com/Valmeria_App/V1/transfers/denyPurchase?tokenEmail=${tokenEmail}`
    
    const completeLink = `https://proyectobancario-back.onrender.com/Valmeria_App/V1/transfers/completePurchase?tokenEmail=${tokenEmail}`

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
        subject: `Compra: ${product.price} ${senderUser.divisas} Product: ${product.nameProduct}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #333333; text-align: center; margin-bottom: 20px;">Confirma tu Compra</h2>
          <p style="text-align: center; color: #555555; margin-bottom: 20px;">Por favor revisa los detalles de tu compra antes de confirmar.</p>
          <p style="text-align: center; color: #555555; margin-bottom: 20px;">Verifica los datos antes de darle click al botón azul.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

          <h3 style="color: #333333; text-align: center; margin-bottom: 15px;">Tus datos:</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 5px 0; color: #555555;"><strong>Nombre completo:</strong> ${senderUser.name}</p>
              <p style="margin: 5px 0; color: #555555;"><strong>Correo electrónico:</strong> ${senderUser.email}</p>
              <p style="margin: 5px 0; color: #555555;"><strong>Número de usuario:</strong> ${senderUser.accountNumber}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

          <h3 style="color: #333333; text-align: center; margin-bottom: 15px;">Detalles del producto:</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <div style="text-align: center; margin-bottom: 15px;">
                  <img src="${product.image}" alt="${product.nameProduct}" style="max-width: 100%; height: auto; border-radius: 5px; border: 1px solid #e0e0e0;">
              </div>
              <p style="margin: 5px 0; color: #555555;"><strong>Nombre del producto:</strong> ${product.nameProduct}</p>
              <p style="margin: 5px 0; color: #555555;"><strong>ID del producto:</strong> ${product.id}</p>
              <p style="margin: 5px 0; color: #555555;"><strong>Precio:</strong> ${product.price} ${senderUser.divisas}</p>
              <p style="margin: 5px 0; color: #555555;"><strong>ID de transacción:</strong> ${transfer.id}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

          <div style="text-align: center; margin-bottom: 10px;">
              <a href="${completeLink}" target="_blank" style="display: inline-block; padding: 12px 25px; background-color: #0082ec; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-bottom: 10px;">Confirmar Compra</a>
          </div>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

          <p style="text-align: center; color: #555555; margin-bottom: 20px;">Si no has realizado esta compra, por favor deniégala usando el siguiente botón.</p>

          <div style="text-align: center; margin-bottom: 20px;">
              <a href="${denyLink}" target="_blank" style="display: inline-block; padding: 12px 25px; background-color: #e11c1c; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Denegar Compra</a>
          </div>

          <p style="text-align: center; color: #999999; font-size: 12px;">Este enlace expirará en 1:30 minutos.</p>
        </div>
        ` 
    })
}

export const validateAddPaymentServiceEmail = async (req, res, senderUser, service, transfer, newAmount) => {
    const tokenEmail = jwt.sign(
      {
        email: senderUser.email,
        number: service.id,
        amount: newAmount,
        transferId : transfer.id,
        userId: senderUser.id
      },
      process.env.SECRETOPRIVATEKEY,
      {
        expiresIn: "1.5m"
      }
    )
    const denyLink = `https://proyectobancario-back.onrender.com/Valmeria_App/V1/transfers/denyPayment?tokenEmail=${tokenEmail}`
    
    const completeLink = `https://proyectobancario-back.onrender.com/Valmeria_App/V1/transfers/completePayment?tokenEmail=${tokenEmail}`

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
        subject: `Paga: ${newAmount} ${senderUser.divisas} Service: ${service.nameService}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #333333; text-align: center; margin-bottom: 20px;">Confirma tu Pago</h2>
          <p style="text-align: center; color: #555555; margin-bottom: 20px;">Por favor revisa los detalles de tu pago antes de confirmar.</p>
          <p style="text-align: center; color: #555555; margin-bottom: 20px;">Verifica los datos antes de darle click al botón azul.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

          <h3 style="color: #333333; text-align: center; margin-bottom: 15px;">Tus datos:</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 5px 0; color: #555555;"><strong>Nombre completo:</strong> ${senderUser.name}</p>
              <p style="margin: 5px 0; color: #555555;"><strong>Correo electrónico:</strong> ${senderUser.email}</p>
              <p style="margin: 5px 0; color: #555555;"><strong>Número de usuario:</strong> ${senderUser.accountNumber}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

          <h3 style="color: #333333; text-align: center; margin-bottom: 15px;">Detalles del servicio:</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <div style="text-align: center; margin-bottom: 15px;">
                  <img src="${service.image}" alt="${service.nameService}" style="max-width: 100%; height: auto; border-radius: 5px; border: 1px solid #e0e0e0;">
              </div>
              <p style="margin: 5px 0; color: #555555;"><strong>Nombre del servicio:</strong> ${service.nameService}</p>
              <p style="margin: 5px 0; color: #555555;"><strong>ID del servicio:</strong> ${service.id}</p>
              <p style="margin: 5px 0; color: #555555;"><strong>Precio:</strong> ${newAmount} ${senderUser.divisas}</p>
              <p style="margin: 5px 0; color: #555555;"><strong>ID de transacción:</strong> ${transfer.id}</p>
          </div>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

          <div style="text-align: center; margin-bottom: 10px;">
              <a href="${completeLink}" target="_blank" style="display: inline-block; padding: 12px 25px; background-color: #0082ec; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-bottom: 10px;">Confirmar Compra</a>
          </div>

          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">

          <p style="text-align: center; color: #555555; margin-bottom: 20px;">Si no has realizado esta compra, por favor deniégala usando el siguiente botón.</p>

          <div style="text-align: center; margin-bottom: 20px;">
              <a href="${denyLink}" target="_blank" style="display: inline-block; padding: 12px 25px; background-color: #e11c1c; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Denegar Compra</a>
          </div>

          <p style="text-align: center; color: #999999; font-size: 12px;">Este enlace expirará en 1:30 minutos.</p>
        </div>
        ` 
    })
}

export const validateBuyProduct = async (req, res, senderUser, product) => {

    if(!product){
        return res.status(401).json({
            msg: 'The product doesnt exist.'
        })
    }

    if(senderUser.role == "ADMIN"){
        return res.status(401).json({
            msg: 'You must be an user to use this.'
        })
    }
    if(senderUser.income == 0){
        return res.status(400).json({
            success: false,
            message: "You dont have any balance.",
        })
    }

    if(( senderUser.income - parseFloat(product.price)) < 0){
        return res.status(400).json({
            success: false,
            message: "Amount overcame your balance.",
        })
    }
}

export const validatePayService = async (req, res, senderUser, service, amount) => {
    if(!service){
        return res.status(401).json({
            msg: 'The product doesnt exist.'
        })
    }

    if(senderUser.role == "ADMIN"){
        return res.status(401).json({
            msg: 'You must be an user to use this.'
        })
    }
    if(senderUser.income == 0){
        return res.status(400).json({
            success: false,
            message: "You dont have any balance.",
        })
    }
    if(service.exclusive){
      if(( senderUser.income - parseFloat(service.price)) < 0){
          return res.status(400).json({
              success: false,
              message: "Amount overcame your balance.",
          })
      }
    } else{
      if(( senderUser.income - parseFloat(amount)) < 0){
          return res.status(400).json({
              success: false,
              message: "Amount overcame your balance.",
          })
      }
    }
}

export const validateMakeAUserFavorite = async (req, res, senderUser, userList) => {
    const {number} = req.params

    if(senderUser.role == "ADMIN"){
        return res.status(401).json({
            msg: 'You must be an user to use this.'
        })
    }

    let proof = {}

    userList.map(localUser=>{
      if(localUser.number == number){
        if(localUser.favorite == false){
          localUser.favorite = true
        } else{
          localUser.favorite = false
        }
        proof = localUser
      }
    })

    await User.findByIdAndUpdate(senderUser.id,{userList},{new:true})
    return res.status(200).json({
        success: true,
        message: "Marked as favorite successfully.",
        proof
    })
}

export const validateListUserTransfered = async (req, res, senderUser) => {
    if(senderUser.role == "ADMIN"){
        return res.status(401).json({
            msg: 'You must be an user to use this.'
        })
    }
    let userList = senderUser.userList
    userList.sort((a, b) => {
      if (a.favorite === b.favorite) return 0
      return a.favorite ? -1 : 1
    })

    return res.status(200).json({
        success: true,
        message: "Users found.",
        userList
    })
}


export const validateCompleteTransfer = async (req, res, senderUser, addresserUser, currentDate) => {
    const token = req.query.tokenEmail
    const { number, alias, transferId, amount } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
    let userList = []
    userList = senderUser.userList
    if (!userList.find(user => user.number == addresserUser.accountNumber)) {
      if(!alias){
        return res.send(`
          <!DOCTYPE html>
          <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Alias Requerido | Valmeria</title>
            <style>
              :root {
                --primary: #4CAF50;
                --primary-dark: #2E7D32;
                --secondary: #2196F3;
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
              .transfer-card {
                background: white;
                max-width: 500px;
                width: 100%;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                text-align: center;
              }
              .success-icon {
                font-size: 60px;
                color: var(--primary);
                margin-bottom: 20px;
              }
              h1 {
                color: var(--primary);
                margin-bottom: 15px;
                font-size: 28px;
              }
              .transfer-details {
                background: #f5f5f5;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
                text-align: left;
              }
              .detail-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
              }
              .detail-label {
                color: #666;
                font-weight: 500;
              }
              .detail-value {
                color: var(--text);
                font-weight: 600;
              }
              .amount {
                font-size: 24px;
                color: var(--primary);
                font-weight: 700;
                margin: 15px 0;
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
                margin: 5px;
              }
              .btn:hover {
                background: var(--primary-dark);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
              }
              .btn-secondary {
                background: var(--secondary);
              }
              .btn-secondary:hover {
                background: #1976D2;
                box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
              }
              .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #777;
              }
              .highlight {
                font-weight: 700;
                color: var(--primary-dark);
              }
            </style>
          </head>
          <body>
            <div class="transfer-card">
              <h1>Alias Requerido</h1>
              <p>Para completar la transferencia, debes agregar un alias a este usuario.</p>
              <div class="transfer-details">
                <div class="detail-row">
                  <span class="detail-label">Nombre del usuario:</span>
                  <span class="detail-value highlight">${addresserUser.name}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Número de cuenta:</span>
                  <span class="detail-value">•••• ${number.toString().slice(-4)}</span>
                </div>
              </div>
              <div class="footer">
                <p>El alias te ayudará a identificar fácilmente al usuario en futuras transacciones.</p>
              </div>
            </div>
          </body>
          </html>
          `);
      }
      userList.push({ number: addresserUser.accountNumber, favorite: false, alias })
    } else {
      if(alias){
        userList.map(localUser=>{
          if(localUser.number == number){
            localUser.alias = alias
          }
        })
      }
    }

    const validateTransfer = await Transfer.findById(transferId)

    if(validateTransfer.verification == true && validateTransfer.verificationEmail == false){
      await valodateDenyTransfer(req, res, senderUser, addresserUser, token, currentDate)
        if(res.headersSent) return
    }
    if(validateTransfer.verification == false && validateTransfer.verificationEmail == false){
      await User.findByIdAndUpdate(
          senderUser.id,
          {
              income: senderUser.income - parseFloat(amount),
              userList
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
      await Transfer.findByIdAndUpdate(transferId,{
          date: currentDate,
          verification: true,
          verificationEmail: true
      })
    }


    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transferencia Completada | Valmeria</title>
        <style>
          :root {
            --primary: #4CAF50;  /* Verde principal */
            --primary-dark: #388E3C; /* Verde oscuro */
            --secondary: #6c757d; /* Gris (secundario) */
            --accent: #4CAF50; /* Verde también para el acento */
            --text: #2d3748; /* Color de texto principal */
            --light-bg: #f8fafc; /* Fondo claro */
            --card-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }
      
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          }
      
          body {
            background-color: var(--light-bg);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
            line-height: 1.5;
          }
      
          .transfer-card {
            background: white;
            max-width: 520px;
            width: 100%;
            padding: 2.5rem;
            border-radius: 16px;
            box-shadow: var(--card-shadow);
            text-align: center;
          }
      
          .success-icon {
            font-size: 72px;
            color: var(--accent);
            margin-bottom: 1.5rem;
          }
      
          h1 {
            color: var(--primary);
            margin-bottom: 1rem;
            font-size: 1.75rem;
            font-weight: 700;
          }
      
          .transfer-details {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 1.5rem;
            margin: 2rem 0;
            text-align: left;
            border: 1px solid #e9ecef;
          }
      
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            align-items: center;
          }
      
          .detail-label {
            color: #6c757d;
            font-weight: 500;
            font-size: 0.9rem;
          }
      
          .detail-value {
            color: var(--text);
            font-weight: 600;
            text-align: right;
          }
      
          .amount {
            font-size: 1.75rem;
            color: var(--accent);
            font-weight: 700;
            margin: 1.5rem 0;
            text-align: center;
            letter-spacing: 0.5px;
          }
      
          .btn-container {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 1.5rem;
          }
      
          .btn {
            display: inline-flex;
            padding: 0.75rem 1.75rem;
            background: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.2s ease;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
            font-size: 0.95rem;
          }
      
          .btn:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
          }
      
          .btn-secondary {
            background: var(--secondary);
          }
      
          .btn-secondary:hover {
            background: #5a6268;
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
          }
      
          .footer {
            margin-top: 2rem;
            font-size: 0.8rem;
            color: #6c757d;
            line-height: 1.6;
          }
      
          .highlight {
            font-weight: 700;
            color: var(--primary);
          }
      
          @media (max-width: 480px) {
            .transfer-card {
              padding: 1.5rem;
            }

            .btn-container {
              flex-direction: column;
            }

            .btn {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="transfer-card">
          <h1>Transferencia Completada</h1>
          <p>Tu transacción se ha procesado exitosamente</p>

          <div class="transfer-details">
            <div class="detail-row">
              <span class="detail-label">Número de transacción:</span>
              <span class="detail-value highlight">${transferId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fecha:</span>
              <span class="detail-value">${new Date().toLocaleString('es-ES')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Desde cuenta:</span>
              <span class="detail-value">•••• ${senderUser.accountNumber.toString().slice(-4)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">A cuenta:</span>
              <span class="detail-value">•••• ${number.toString().slice(-4)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Beneficiario:</span>
              <span class="detail-value">${addresserUser.name}</span>
            </div>
            <div class="amount">${parseFloat(amount).toFixed(2)} ${senderUser.divisas}</div>
          </div>
          <div class="footer">
            <p>¿No reconoces esta transacción? Contacta inmediatamente a nuestro equipo de soporte.</p>
          </div>
        </div>
      </body>
      </html>
      `);
}

export const validateCompletePurchase = async (req, res, senderUser, product, currentDate) => {
    const token = req.query.tokenEmail
    const { transferId, amount } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)

    const validateTransfer = await Transfer.findById(transferId)

    if(validateTransfer.verification == true && validateTransfer.verificationEmail == false){
      await validateDenyPurchase(req, res, senderUser, service, token, currentDate)
        if(res.headersSent) return
    }

    if(validateTransfer.verification == false && validateTransfer.verificationEmail == false){
      await User.findByIdAndUpdate(
        senderUser.id,
        {
          income: senderUser.income - parseFloat(amount),
        },
        {new:true}
      )
      
      await Transfer.findByIdAndUpdate(transferId,{
          date: currentDate,
          verification: true,
          verificationEmail: true
      })
    }

    res.send(`
      <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Compra Exitosa | Valmeria</title>
          <style>
            :root {
              --primary: #4CAF50;  /* Verde principal */
              --primary-dark: #388E3C; /* Verde oscuro */
              --secondary: #6c757d; /* Gris (secundario) */
              --accent: #4CAF50; /* Verde también para el acento */
              --text: #2d3748; /* Color de texto principal */
              --light-bg: #f8fafc; /* Fondo claro */
              --card-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            }

            body {
              background-color: var(--light-bg);
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 20px;
              line-height: 1.5;
            }

            .purchase-card {
              background: white;
              max-width: 520px;
              width: 100%;
              padding: 2.5rem;
              border-radius: 16px;
              box-shadow: var(--card-shadow);
              text-align: center;
            }

            .success-icon {
              font-size: 72px;
              color: var(--accent);
              margin-bottom: 1.5rem;
            }

            h1 {
              color: var(--primary);
              margin-bottom: 1rem;
              font-size: 1.75rem;
              font-weight: 700;
            }

            .product-image {
              width: 100%;
              max-height: 200px;
              object-fit: contain;
              border-radius: 8px;
              margin: 1.5rem 0;
              border: 1px solid #e9ecef;
            }

            .purchase-details {
              background: #f8f9fa;
              border-radius: 12px;
              padding: 1.5rem;
              margin: 2rem 0;
              text-align: left;
              border: 1px solid #e9ecef;
            }

            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.75rem;
              align-items: center;
            }

            .detail-label {
              color: #6c757d;
              font-weight: 500;
              font-size: 0.9rem;
            }

            .detail-value {
              color: var(--text);
              font-weight: 600;
              text-align: right;
            }

            .amount {
              font-size: 1.75rem;
              color: var(--accent);
              font-weight: 700;
              margin: 1.5rem 0;
              text-align: center;
              letter-spacing: 0.5px;
            }

            .btn-container {
              display: flex;
              gap: 12px;
              justify-content: center;
              margin-top: 1.5rem;
            }

            .btn {
              display: inline-flex;
              padding: 0.75rem 1.75rem;
              background: var(--primary);
              color: white;
              text-decoration: none;
              border-radius: 50px;
              font-weight: 600;
              transition: all 0.2s ease;
              align-items: center;
              justify-content: center;
              border: none;
              cursor: pointer;
              font-size: 0.95rem;
            }

            .btn:hover {
              background: var(--primary-dark);
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            }

            .btn-secondary {
              background: var(--secondary);
            }

            .btn-secondary:hover {
              background: #5a6268;
              box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
            }

            .footer {
              margin-top: 2rem;
              font-size: 0.8rem;
              color: #6c757d;
              line-height: 1.6;
            }

            .highlight {
              font-weight: 700;
              color: var(--primary);
            }

            @media (max-width: 480px) {
              .purchase-card {
                padding: 1.5rem;
              }

              .btn-container {
                flex-direction: column;
              }

              .btn {
                width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="purchase-card">
            <h1>¡Compra Exitosa!</h1>
            <p>Tu producto ha sido adquirido satisfactoriamente</p>
            <div class="purchase-details">
              <div class="detail-row">
                <span class="detail-label">Número de orden:</span>
                <span class="detail-value highlight">#${transferId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Fecha:</span>
                <span class="detail-value">${new Date().toLocaleString('es-ES')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Producto:</span>
                <span class="detail-value">${product.nameProduct}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ID del producto:</span>
                <span class="detail-value">${product.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Comprador:</span>
                <span class="detail-value">${senderUser.name}</span>
              </div>
              <div class="amount">${parseFloat(product.price).toFixed(2)} ${senderUser.divisas}</div>
            </div>
            <div class="footer">
              <p>¿Tienes problemas con tu compra? Contacta a nuestro equipo de soporte.</p>
            </div>
          </div>
        </body>
        </html>
      `);
}

export const validateCompletePayment = async (req, res, senderUser, service, currentDate) => {
    const token = req.query.tokenEmail
    const { transferId, amount } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)

    const validateTransfer = await Transfer.findById(transferId)

    if(validateTransfer.verification == true && validateTransfer.verificationEmail == false){
      await validateDenyPayment(req, res, senderUser, service, token, currentDate)
        if(res.headersSent) return
    }

    if(validateTransfer.verification == false && validateTransfer.verificationEmail == false){
      await User.findByIdAndUpdate(
        senderUser.id,
        {
          income: senderUser.income - parseFloat(amount),
        },
        {new:true}
      )
      
      await Transfer.findByIdAndUpdate(transferId,{
          date: currentDate,
          verification: true,
          verificationEmail: true
      })
    }

    res.send(`
      <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pago Exitoso | Valmeria</title>
          <style>
            :root {
              --primary: #4CAF50;  /* Verde principal */
              --primary-dark: #388E3C; /* Verde oscuro */
              --secondary: #6c757d; /* Gris (secundario) */
              --accent: #4CAF50; /* Verde también para el acento */
              --text: #2d3748; /* Color de texto principal */
              --light-bg: #f8fafc; /* Fondo claro */
              --card-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            }

            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            }

            body {
              background-color: var(--light-bg);
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 20px;
              line-height: 1.5;
            }

            .purchase-card {
              background: white;
              max-width: 520px;
              width: 100%;
              padding: 2.5rem;
              border-radius: 16px;
              box-shadow: var(--card-shadow);
              text-align: center;
            }

            .success-icon {
              font-size: 72px;
              color: var(--accent);
              margin-bottom: 1.5rem;
            }

            h1 {
              color: var(--primary);
              margin-bottom: 1rem;
              font-size: 1.75rem;
              font-weight: 700;
            }

            .product-image {
              width: 100%;
              max-height: 200px;
              object-fit: contain;
              border-radius: 8px;
              margin: 1.5rem 0;
              border: 1px solid #e9ecef;
            }

            .purchase-details {
              background: #f8f9fa;
              border-radius: 12px;
              padding: 1.5rem;
              margin: 2rem 0;
              text-align: left;
              border: 1px solid #e9ecef;
            }

            .detail-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.75rem;
              align-items: center;
            }

            .detail-label {
              color: #6c757d;
              font-weight: 500;
              font-size: 0.9rem;
            }

            .detail-value {
              color: var(--text);
              font-weight: 600;
              text-align: right;
            }

            .amount {
              font-size: 1.75rem;
              color: var(--accent);
              font-weight: 700;
              margin: 1.5rem 0;
              text-align: center;
              letter-spacing: 0.5px;
            }

            .btn-container {
              display: flex;
              gap: 12px;
              justify-content: center;
              margin-top: 1.5rem;
            }

            .btn {
              display: inline-flex;
              padding: 0.75rem 1.75rem;
              background: var(--primary);
              color: white;
              text-decoration: none;
              border-radius: 50px;
              font-weight: 600;
              transition: all 0.2s ease;
              align-items: center;
              justify-content: center;
              border: none;
              cursor: pointer;
              font-size: 0.95rem;
            }

            .btn:hover {
              background: var(--primary-dark);
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
            }

            .btn-secondary {
              background: var(--secondary);
            }

            .btn-secondary:hover {
              background: #5a6268;
              box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
            }

            .footer {
              margin-top: 2rem;
              font-size: 0.8rem;
              color: #6c757d;
              line-height: 1.6;
            }

            .highlight {
              font-weight: 700;
              color: var(--primary);
            }

            @media (max-width: 480px) {
              .purchase-card {
                padding: 1.5rem;
              }

              .btn-container {
                flex-direction: column;
              }

              .btn {
                width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="purchase-card">
            <h1>¡Pago Exitoso!</h1>
            <p>Tu servicio ha sido pagado satisfactoriamente!</p>
            <div class="purchase-details">
              <div class="detail-row">
                <span class="detail-label">Número de transacción:</span>
                <span class="detail-value highlight">#${transferId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Fecha:</span>
                <span class="detail-value">${new Date().toLocaleString('es-ES')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Servicio:</span>
                <span class="detail-value">${service.nameService}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">ID del producto:</span>
                <span class="detail-value">${service.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Comprador:</span>
                <span class="detail-value">${senderUser.name}</span>
              </div>
              <div class="amount">${parseFloat(amount).toFixed(2)} ${senderUser.divisas}</div>
            </div>
            <div class="footer">
              <p>¿Tienes problemas con tu compra? Contacta a nuestro equipo de soporte.</p>
            </div>
          </div>
        </body>
        </html>
      `);
}


export const valodateDenyTransfer = async (req, res, senderUser, addresserUser, token, currentDate) => {
    const { number, amount, transferId } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)

    const validateTransfer = await Transfer.findById(transferId)
    if(validateTransfer.verification == true && validateTransfer.verificationEmail == true){
      await validateCompleteTransfer(req, res, senderUser, addresserUser, currentDate)
        if(res.headersSent) return
    }
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Transferencia Rechazada | Valmeria</title>
        <style>
          :root {
            --primary: #000000;  /* Negro principal */
            --error: #f44336; /* Rojo para elementos importantes */
            --secondary: #6c757d; /* Gris (secundario) */
            --text: #333333; /* Color de texto principal */
            --light-text: #9e9e9e; /* Gris claro para texto secundario */
            --light-bg: #f8fafc; /* Fondo claro */
            --card-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          }

          body {
            background-color: var(--light-bg);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
            line-height: 1.5;
          }

          .transfer-card {
            background: white;
            max-width: 520px;
            width: 100%;
            padding: 2.5rem;
            border-radius: 16px;
            box-shadow: var(--card-shadow);
            text-align: center;
          }

          .error-icon {
            font-size: 72px;
            color: var(--error);
            margin-bottom: 1.5rem;
          }

          h1 {
            color: var(--error);
            margin-bottom: 1rem;
            font-size: 1.75rem;
            font-weight: 700;
          }

          .transfer-details {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 1.5rem;
            margin: 2rem 0;
            text-align: left;
            border: 1px solid #e9ecef;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            align-items: center;
          }

          .detail-label {
            color: var(--primary);
            font-weight: 500;
            font-size: 0.9rem;
          }

          .detail-value {
            color: var(--text);
            font-weight: 600;
            text-align: right;
          }

          .amount {
            font-size: 1.75rem;
            color: var(--error);
            font-weight: 700;
            margin: 1.5rem 0;
            text-align: center;
            letter-spacing: 0.5px;
          }

          .btn-container {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 1.5rem;
          }

          .btn {
            display: inline-flex;
            padding: 0.75rem 1.75rem;
            background: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.2s ease;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
            font-size: 0.95rem;
          }

          .btn:hover {
            background: #333333;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .btn-secondary {
            background: var(--secondary);
          }

          .btn-secondary:hover {
            background: #5a6268;
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
          }

          .footer {
            margin-top: 2rem;
            font-size: 0.8rem;
            color: var(--light-text);
            line-height: 1.6;
          }

          .highlight {
            font-weight: 700;
            color: var(--error);
          }

          @media (max-width: 480px) {
            .transfer-card {
              padding: 1.5rem;
            }

            .btn-container {
              flex-direction: column;
            }

            .btn {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="transfer-card">
          <h1>Transferencia Rechazada</h1>
          <p style="color: var(--primary)">Has cancelado exitosamente esta transacción</p>

          <div class="transfer-details">
            <div class="detail-row">
              <span class="detail-label">Número de transacción:</span>
              <span class="detail-value highlight">${transferId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fecha:</span>
              <span class="detail-value">${new Date().toLocaleString('es-ES')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Destinatario:</span>
              <span class="detail-value">${addresserUser.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Cuenta destino:</span>
              <span class="detail-value">•••• ${number.toString().slice(-4)}</span>
            </div>
            <div class="amount">${parseFloat(amount).toFixed(2)} ${senderUser.divisas}</div>
          </div>
          <div class="footer">
            <p>¿No reconoces esta acción? Protege tu cuenta cambiando tu contraseña.</p>
          </div>
        </div>
      </body>
      </html>
      `);
}

export const validateDenyPurchase = async (req, res, senderUser, product, token, currentDate) => {
    const { number, amount, transferId } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
    
    const validateTransfer = await Transfer.findById(transferId)
    if(validateTransfer.verification == true && validateTransfer.verificationEmail == true){
      await validateCompletePurchase(req, res, senderUser, product, currentDate)
        if(res.headersSent) return
    }
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Compra Rechazada | Valmeria</title>
        <style>
          :root {
            --primary: #000000;  /* Negro principal */
            --error: #f44336; /* Rojo para elementos importantes */
            --secondary: #6c757d; /* Gris (secundario) */
            --text: #333333; /* Color de texto principal */
            --light-text: #9e9e9e; /* Gris claro para texto secundario */
            --light-bg: #f8fafc; /* Fondo claro */
            --card-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          }

          body {
            background-color: var(--light-bg);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
            line-height: 1.5;
          }

          .transfer-card {
            background: white;
            max-width: 520px;
            width: 100%;
            padding: 2.5rem;
            border-radius: 16px;
            box-shadow: var(--card-shadow);
            text-align: center;
          }

          .error-icon {
            font-size: 72px;
            color: var(--error);
            margin-bottom: 1.5rem;
          }

          h1 {
            color: var(--error);
            margin-bottom: 1rem;
            font-size: 1.75rem;
            font-weight: 700;
          }

          .transfer-details {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 1.5rem;
            margin: 2rem 0;
            text-align: left;
            border: 1px solid #e9ecef;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            align-items: center;
          }

          .detail-label {
            color: var(--primary);
            font-weight: 500;
            font-size: 0.9rem;
          }

          .detail-value {
            color: var(--text);
            font-weight: 600;
            text-align: right;
          }

          .amount {
            font-size: 1.75rem;
            color: var(--error);
            font-weight: 700;
            margin: 1.5rem 0;
            text-align: center;
            letter-spacing: 0.5px;
          }

          .btn-container {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 1.5rem;
          }

          .btn {
            display: inline-flex;
            padding: 0.75rem 1.75rem;
            background: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.2s ease;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
            font-size: 0.95rem;
          }

          .btn:hover {
            background: #333333;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .btn-secondary {
            background: var(--secondary);
          }

          .btn-secondary:hover {
            background: #5a6268;
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
          }

          .footer {
            margin-top: 2rem;
            font-size: 0.8rem;
            color: var(--light-text);
            line-height: 1.6;
          }

          .highlight {
            font-weight: 700;
            color: var(--error);
          }

          @media (max-width: 480px) {
            .transfer-card {
              padding: 1.5rem;
            }

            .btn-container {
              flex-direction: column;
            }

            .btn {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="transfer-card">
          <h1>Compra Rechazada</h1>
          <p style="color: var(--primary)">Has cancelado exitosamente esta compra.</p>

          <div class="transfer-details">
            <div class="detail-row">
              <span class="detail-label">Número de compra:</span>
              <span class="detail-value highlight">${transferId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fecha:</span>
              <span class="detail-value">${new Date().toLocaleString('es-ES')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Producto:</span>
              <span class="detail-value">${product.nameProduct}</span>
            </div>
            <div class="amount">${parseFloat(amount).toFixed(2)} ${senderUser.divisas}</div>
          </div>
          <div class="footer">
            <p>¿No reconoces esta acción? Protege tu cuenta cambiando tu contraseña.</p>
          </div>
        </div>
      </body>
      </html>
      `);
}

export const validateDenyPayment = async (req, res, senderUser, service, token, currentDate) => {
    const { number, amount, transferId } = jwt.verify(token, process.env.SECRETOPRIVATEKEY)
    
    const validateTransfer = await Transfer.findById(transferId)
    if(validateTransfer.verification == true && validateTransfer.verificationEmail == true){
      await validateCompletePayment(req, res, senderUser, service, currentDate)
        if(res.headersSent) return
    }
    res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pago Rechazado | Valmeria</title>
        <style>
          :root {
            --primary: #000000;  /* Negro principal */
            --error: #f44336; /* Rojo para elementos importantes */
            --secondary: #6c757d; /* Gris (secundario) */
            --text: #333333; /* Color de texto principal */
            --light-text: #9e9e9e; /* Gris claro para texto secundario */
            --light-bg: #f8fafc; /* Fondo claro */
            --card-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          }

          body {
            background-color: var(--light-bg);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
            line-height: 1.5;
          }

          .transfer-card {
            background: white;
            max-width: 520px;
            width: 100%;
            padding: 2.5rem;
            border-radius: 16px;
            box-shadow: var(--card-shadow);
            text-align: center;
          }

          .error-icon {
            font-size: 72px;
            color: var(--error);
            margin-bottom: 1.5rem;
          }

          h1 {
            color: var(--error);
            margin-bottom: 1rem;
            font-size: 1.75rem;
            font-weight: 700;
          }

          .transfer-details {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 1.5rem;
            margin: 2rem 0;
            text-align: left;
            border: 1px solid #e9ecef;
          }

          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            align-items: center;
          }

          .detail-label {
            color: var(--primary);
            font-weight: 500;
            font-size: 0.9rem;
          }

          .detail-value {
            color: var(--text);
            font-weight: 600;
            text-align: right;
          }

          .amount {
            font-size: 1.75rem;
            color: var(--error);
            font-weight: 700;
            margin: 1.5rem 0;
            text-align: center;
            letter-spacing: 0.5px;
          }

          .btn-container {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-top: 1.5rem;
          }

          .btn {
            display: inline-flex;
            padding: 0.75rem 1.75rem;
            background: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.2s ease;
            align-items: center;
            justify-content: center;
            border: none;
            cursor: pointer;
            font-size: 0.95rem;
          }

          .btn:hover {
            background: #333333;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          }

          .btn-secondary {
            background: var(--secondary);
          }

          .btn-secondary:hover {
            background: #5a6268;
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
          }

          .footer {
            margin-top: 2rem;
            font-size: 0.8rem;
            color: var(--light-text);
            line-height: 1.6;
          }

          .highlight {
            font-weight: 700;
            color: var(--error);
          }

          @media (max-width: 480px) {
            .transfer-card {
              padding: 1.5rem;
            }

            .btn-container {
              flex-direction: column;
            }

            .btn {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="transfer-card">
          <h1>Pago Rechazado</h1>
          <p style="color: var(--primary)">Has cancelado exitosamente esta pago.</p>

          <div class="transfer-details">
            <div class="detail-row">
              <span class="detail-label">Número de pago:</span>
              <span class="detail-value highlight">${transferId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fecha:</span>
              <span class="detail-value">${new Date().toLocaleString('es-ES')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Servicio:</span>
              <span class="detail-value">${service.nameService}</span>
            </div>
            <div class="amount">${parseFloat(amount).toFixed(2)} ${senderUser.divisas}</div>
          </div>
          <div class="footer">
            <p>¿No reconoces esta acción? Protege tu cuenta cambiando tu contraseña.</p>
          </div>
        </div>
      </body>
      </html>
      `);
}

export const valodateGetTransferencesByUser = async (req, res, currentUser) => {
  if(currentUser.role == "USER"){
      return res.status(401).json({
          msg: 'You must be an admin to use this.'
      })
  }
}

export const validateGetTransferences = async (req, res, currentUser) => {
  if(currentUser.role == "ADMIN"){
      return res.status(401).json({
          msg: 'You must be an user to use this.'
      })
  }
}