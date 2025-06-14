import { Router } from "express";
import { login, register } from "./authController.js";
import { dpiValidationMiddleware } from "../middlewares/validateDPI.js";
<<<<<<< HEAD
import { loginValidator, registerValidator } from "../middlewares/validatorAuth.js";
import { passwordValidatorMiddleware } from "../middlewares/validatorPasswords.js";
=======
import { registerValidator } from "../middlewares/validatorAuth.js";
import { passwordValidatorMiddleware } from "../middlewares/validatorPasswords.js";
import { verifyEmail } from "./authController.js";
>>>>>>> Acarrillo-2020412

const router = Router()

router.post(
    "/login",
<<<<<<< HEAD
    loginValidator,
=======
>>>>>>> Acarrillo-2020412
    login
)

router.post(
    "/register",
    dpiValidationMiddleware,
    passwordValidatorMiddleware,
    registerValidator,
    register
)

<<<<<<< HEAD
=======
router.get("/verify", verifyEmail)

>>>>>>> Acarrillo-2020412
export default router