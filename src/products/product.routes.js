import { Router } from "express";
import { getProducts, getProductsById, createProduct, updateProduct, deleteProduct } from "./product.controller.js";

const router = Router();

router.get(
    '/allProducts',
    getProducts
)

router.get(
    '/findProduct/:id',
    getProductsById
)

router.post(
    '/createProduct',
    createProduct
)

router.put(
    '/updateProduct/:id',
    updateProduct
)

router.delete(
    '/deleteProduct/:id',
    deleteProduct
)

export default router;