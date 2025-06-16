import { Router } from "express";
import { getBrands, getBrandsById, createBrand, updateBrand, deleteBrand } from "./brand.controller.js";
import { validatorCreateBrand, validatorUpdateBrand, validatorDeleteBrand } from "../middlewares/validatorBrand.js";
import { valueJWT } from "../middlewares/valueJWT.js";

const router = Router();

router.get(
    '/allBrands',
    valueJWT,
    getBrands
)

router.get(
    '/findBrand/:id',
    valueJWT,
    getBrandsById
)

router.post(
    '/createBrand',
    validatorCreateBrand,
    createBrand
)

router.put(
    '/updateBrand/:id',
    validatorUpdateBrand,
    updateBrand
)

router.delete(
    '/deleteBrand/:id',
    validatorDeleteBrand,
    deleteBrand
)

export default router;