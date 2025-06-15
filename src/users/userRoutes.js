import { Router } from "express";
import { listDataUser, updateDatauser, updatePassword } from "./userController.js";
import { passwordValidatorMiddleware } from "../middlewares/validatorPasswords.js";
import { valueJWT } from "../middlewares/valueJWT.js"

const router = Router()

router.get(
    "/personalData",
    valueJWT,
    listDataUser
)

router.put(
    "/updateData",
    valueJWT,
    updateDatauser
)

router.put(
    "/updatePassword/:id",
    valueJWT,
    passwordValidatorMiddleware,
    updatePassword
)

export default router