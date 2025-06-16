export const validateToken = async (req, res) => {
    const token = await req.header('Authorization')
    if(!token){
        return res.status(401).json({
            msg: 'Token not found.'
        })
    }
}

export const validateEmailToken = async (req, res) => {
    const token = req.query.token;
    if(!token){
        return res.status(401).json({
            msg: 'Token not found.'
        })
    }
}

export const validateEmailTokenVerify = async (req, res) => {
    const token = req.query.tokenEmail
    if(!token){
        return res.status(401).json({
            msg: 'Token not found.'
        })
    }
}

export const validateExpiredToken = async (req, res) => {
    return res.send(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Token Expirado | Valmeria</title>
        <style>
          :root {
            --primary: #F44336;
            --primary-dark: #D32F2F;
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
          .error-icon {
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
            text-align: center;
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
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
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
          <h1>Token Expirado</h1>
          <p>El enlace de verificación ha caducado.</p>
          
          <div class="transfer-details">
            <p>Por seguridad, los enlaces de verificación tienen 1:30 minutos de duración.</p>
            <p class="highlight">Debes solicitar un nuevo enlace para continuar.</p>
          </div>
          <div class="footer">
            <p>Si necesitas ayuda, por favor contacta a nuestro equipo de soporte.</p>
          </div>
        </div>
      </body>
      </html>
      `);
}