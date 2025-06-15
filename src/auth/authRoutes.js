import { Router } from "express";
import { login, register } from "./authController.js";
import { dpiValidationMiddleware } from "../middlewares/validateDPI.js";
import { loginValidator, registerValidator } from "../middlewares/validatorAuth.js";
import { passwordValidatorMiddleware } from "../middlewares/validatorPasswords.js";
import { verifyEmail } from "./authController.js";

const router = Router()

router.post(
    "/login",
    loginValidator,
    login
)

router.post(
    "/register",
    dpiValidationMiddleware,
    passwordValidatorMiddleware,
    registerValidator,
    register
)

router.get(
    "/verify", 
    verifyEmail
)
export default router