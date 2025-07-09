import { body, param } from "express-validator";
import { validarCampos } from "./validarCampos.js";
import { brandDisabled, existServiceById, existServiceName, notExistBrand } from "../helpers/db-Validator.js";
import { valueJWT } from "./valueJWT.js";

export const validatorCreateService = [
    valueJWT,
    body("nameService", "The nameService is required").notEmpty(),
    body("nameService").custom(existServiceName),
    body("image", "The image is required").notEmpty(),
    body("brand", "Enter a brand for the service").notEmpty(),
    body("brand").custom(notExistBrand),
    body("brand").custom(brandDisabled),
    validarCampos
]

export const validatorUpdateService = [
    valueJWT,
    param("id", "Enter a valid ID").notEmpty(),
    param("id").custom(existServiceById),
    body("nameService", "The nameService is required").notEmpty(),
    body("nameService").custom(existServiceName),
    body("image", "The image is required").notEmpty(),
    body("brand", "Enter a brand for the service").notEmpty(),
    body("brand").custom(notExistBrand),
    body("brand").custom(brandDisabled),
    validarCampos
]

export const validatorDeleteService = [
    valueJWT,
    param("id", "Enter a valid ID").notEmpty(),
    param("id").custom(existServiceById),
    validarCampos
]