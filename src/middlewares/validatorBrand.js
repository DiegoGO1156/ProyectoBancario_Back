import { body, param } from "express-validator";
import { validarCampos } from "./validarCampos.js"
import { noExistBrandById } from "../helpers/db-Validator.js";
import { valueJWT } from "./valueJWT.js";
import { validateRole } from "./validateRole.js";

export const validatorCreateBrand = [
    valueJWT,
    validateRole("ADMIN"),
    body("nameBrand", "The nameBrand is required").notEmpty(),
    body("image", "The image is required").notEmpty(),
    validarCampos
]

export const validatorUpdateBrand = [
    valueJWT,
    validateRole("ADMIN"),
    param("id", "Enter a valid ID").notEmpty(),
    param("id").custom(noExistBrandById),
    body("nameBrand", "The nameBrand is required").notEmpty(),
    body("image", "The image is required").notEmpty(),
    validarCampos
]

export const validatorDeleteBrand = [
    valueJWT,
    validateRole("ADMIN"),
    param("id", "Enter a Valid ID").notEmpty(),
    param("id").custom(noExistBrandById),
    validarCampos
]