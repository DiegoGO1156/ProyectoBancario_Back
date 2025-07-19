import { body, param } from "express-validator";
import { validarCampos } from "./validarCampos.js";
import { valueJWT } from "./valueJWT.js";
import { noExistUserById, minincome, userDisabledId } from "../helpers/db-Validator.js";
import { validateRole } from "./validateRole.js";



export const validatorListPending = [
    valueJWT,
    validateRole("ADMIN"),
    validarCampos
]

export const validatorListActive = [
    valueJWT,
    validateRole("ADMIN"),
    validarCampos
]

export const validatorActiveUser = [
    valueJWT,
    validateRole("ADMIN"),
    param("id", "The ID is required").notEmpty(),
    param("id", "Enter a valid ID").isMongoId(),
    param("id").custom(noExistUserById),
    validarCampos
]   

export const validatorDeleteRegisterUser = [
    valueJWT,
    validateRole("ADMIN"),
    param("id", "The ID is required").notEmpty(),
    param("id", "Enter a valid ID").isMongoId(),
    param("id").custom(noExistUserById),
    validarCampos
]

export const validatorUpdateStatusUser = [
    valueJWT,
    validateRole("ADMIN"),
    param("id", "The ID is required").notEmpty(),
    param("id", "Enter a valid ID").isMongoId(),
    param("id").custom(userDisabledId),
    validarCampos
]

export const validatorUpdateBalanceUser = [
    valueJWT,
    validateRole("ADMIN"),
    param("id", "The ID is required").notEmpty(),
    param("id", "Enter a valid ID").isMongoId(),
    param("id").custom(noExistUserById),
    body("income", "The income is required").notEmpty(),
    body("income", "The income must be a number").isNumeric(),
    body("income").custom(minincome),
    validarCampos
]

export const validatorUpdateDataAdmin = [
    valueJWT,
    validateRole("ADMIN"),
    body("name", "The name is required").notEmpty(),
    body("username", "The username is required").notEmpty(),
    body("email", "The email is required").notEmpty(),
    body("address", "The address is required").notEmpty(),
    body("phone", "The phone is required").notEmpty(),
    body("companyName", "The companyName is required").notEmpty(),
    validarCampos
]       