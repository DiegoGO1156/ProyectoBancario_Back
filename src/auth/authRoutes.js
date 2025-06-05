import { Router } from "express";
import { login, register } from "./authController.js";
import { dpiValidationMiddleware } from "../middlewares/validateDPI.js";
import { loginValidator, registerValidator } from "../middlewares/validatorAuth.js";
import { passwordValidatorMiddleware } from "../middlewares/validatorPasswords.js";

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

export default router