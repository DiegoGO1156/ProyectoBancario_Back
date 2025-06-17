import { body, param } from "express-validator";
import { validarCampos } from "./validarCampos.js"
import { noExistBrandById, existBrandName } from "../helpers/db-Validator.js";
import { valueJWT } from "./valueJWT.js";

export const validatorCreateBrand = [
    valueJWT,
    body("nameBrand", "The nameBrand is required").notEmpty(),
    body("nameBrand").custom(existBrandName),
    body("image", "The image is required").notEmpty(),
    validarCampos
]

export const validatorUpdateBrand = [
    valueJWT,
    param("id", "Enter a valid ID").notEmpty(),
    param("id").custom(noExistBrandById),
    body("nameBrand", "The nameBrand is required").notEmpty(),
    body("nameBrand").custom(existBrandName),
    body("image", "The image is required").notEmpty(),
    validarCampos
]

export const validatorDeleteBrand = [
    valueJWT,
    param("id", "Enter a Valid ID").notEmpty(),
    param("id").custom(noExistBrandById),
    validarCampos
]