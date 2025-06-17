import { body, param } from "express-validator";
import { validarCampos } from "./validarCampos.js";
import { validateRole } from "./validateRole.js";
import { existProductName, noExistProductById, notExistBrand, brandDisabled } from "../helpers/db-Validator.js";
import { valueJWT } from "./valueJWT.js";

export const validatorCreateProduct = [
    valueJWT,
    validateRole("ADMIN"),  
    body("nameProduct", "The nameProduct is required").notEmpty(),
    body("nameProduct").custom(existProductName),
    body("description", "The description is required").notEmpty(),
    body("image", "The image is required").notEmpty(),
    body("price", "The price is required").notEmpty(),
    body("brand", "Enter a brand for the product").notEmpty(),
    body("brand").custom(notExistBrand),
    body("brand").custom(brandDisabled),
    validarCampos
]

export const validatorUpdateProduct = [
    valueJWT,
    validateRole("ADMIN"),
    param("id", "Enter a valid ID").notEmpty(),
    param("id").custom(noExistProductById),
    body("nameProduct", "The nameProduct is required").notEmpty(),
    body("nameProduct").custom(existProductName),
    body("description", "The description is required").notEmpty(),
    body("image", "The image is required").notEmpty(),
    body("price", "The price is required").notEmpty(),
    body("brand", "Enter a brand for the product").notEmpty(),
    body("brand").custom(notExistBrand),
    body("brand").custom(brandDisabled),
    validarCampos
]

export const validatorDeleteProduct = [
    valueJWT,
    validateRole("ADMIN"),
    param("id", "Enter a valid ID").notEmpty(),
    param("id").custom(noExistProductById),
    validarCampos
]