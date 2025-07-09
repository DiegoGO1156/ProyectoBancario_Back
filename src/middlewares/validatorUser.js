import { body } from "express-validator";
import { validateRole } from "./validateRole.js";
import { validarCampos } from "./validarCampos.js";
import { valueJWT } from "./valueJWT.js";
import { emailUsed, usedUsername, usedPhone, minincome } from "../helpers/db-Validator.js";

export const validatorListDataUser = [
    valueJWT,
    validarCampos
]

export const validatorUpdateUser = [
    valueJWT,
    validateRole("USER"),
    body("name", "The name is required").notEmpty(),
    body("username", "The username is required").notEmpty(),
    body("username").custom(usedUsername),
    body("email", "The email is required").notEmpty(),
    body("email").custom(emailUsed),
    body("address", "The address is required").notEmpty(),
    body("phone", "The phone is required").notEmpty(),
    body("phone").custom(usedPhone),
    body("companyName", "The companyName is required").notEmpty(),
    body("income", "The income is required").notEmpty(),
    body("income").custom(minincome),
    validarCampos
]

export const validatorUpdatePassword = [
    valueJWT,
    validateRole("USER", "ADMIN"),
    body("oldPassword", "The oldPassword is required").notEmpty(),
    body("password", "The new Password is required").notEmpty(),
    validarCampos
]