import User from "../users/user.model.js";
import argon2 from 'argon2';

export const verifyPassword = async (req, res, next) => {
    try {
        const { currentPassword } = req.body; 
        
        if (!currentPassword) {
            return res.status(400).json({
                success: false,
                msg: "La contraseña actual es requerida"
            });
        }

        const user = await User.findById(req.user._id)
        
        if (!user) {
            return res.status(404).json({
                success: false,
                msg: "Usuario no encontrado"
            });
        }

        const isMatch = await argon2.verify(user.password, currentPassword);
        
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                msg: "Contraseña actual incorrecta"
            });
        }
        next();
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
};