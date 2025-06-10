import { body, param } from "express-validator";
import { validarCampos } from "./validarCampos.js";
import { existProductById, notExistBrand } from "../helpers/db-Validator.js";
import { valueJWT } from "./valueJWT.js";

export const validatorCreateProduct = [
    valueJWT,
    body("nameProduct", "The nameProduct is required").notEmpty(),
    body("description", "The description is required").notEmpty(),
    body("image", "The image is required").notEmpty(),
    body("price", "The price is required").notEmpty(),
    body("brand", "Enter a brand for the product").notEmpty(),
    body("brand").custom(notExistBrand),
    validarCampos
]

export const validatorUpdateProduct = [
    valueJWT,
    param("id", "Enter a valid ID").notEmpty(),
    param("id").custom(existProductById),
    body("nameProduct", "The nameProduct is required").notEmpty(),
    body("description", "The description is required").notEmpty(),
    body("image", "The image is required").notEmpty(),
    body("price", "The price is required").notEmpty(),
    body("brand", "Enter a brand for the product").notEmpty(),
    body("brand").custom(notExistBrand),
    validarCampos
]

export const validatorDeleteProduct = [
    valueJWT,
    param("id", "Enter a valid ID").notEmpty(),
    param("id").custom(existProductById),
    validarCampos
]