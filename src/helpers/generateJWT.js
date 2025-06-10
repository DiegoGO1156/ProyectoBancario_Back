import jwt  from "jsonwebtoken"

export const generarJWT = (uid = ' ') =>{
    return new Promise((resolve, reject) =>{
        const payload = {uid}
        jwt.sign(
            payload, 
            process.env.SECRETOPRIVATEKEY,
                {
                expiresIn: "5h"
                },
            (err, token) => {
                err ? (console.log(err), reject("No se pudo generar el token")) : resolve(token);
            }
        )
    })
}