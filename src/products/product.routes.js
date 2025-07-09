import { Router } from "express";
import { getProducts, getProductsById, createProduct, updateProduct, deleteProduct } from "./product.controller.js";
import { validatorCreateProduct, validatorUpdateProduct, validatorDeleteProduct } from "../middlewares/validatorProduct.js";
import { valueJWT } from "../middlewares/valueJWT.js";

const router = Router();

router.get(
    '/allProducts',
    valueJWT,
    getProducts
)

router.get(
    '/findProduct/:id',
    valueJWT,
    getProductsById
)

router.post(
    '/createProduct',
    validatorCreateProduct,
    createProduct
)

router.put(
    '/updateProduct/:id',
    validatorUpdateProduct,
    updateProduct
)

router.delete(
    '/deleteProduct/:id',
    validatorDeleteProduct,
    deleteProduct
)

export default router;