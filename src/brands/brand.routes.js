import { Router } from "express";
import { getBrands, getBrandsById, createBrand, updateBrand, deleteBrand } from "./brand.controller.js";
import { validatorCreateBrand, validatorUpdateBrand, validatorDeleteBrand } from "../middlewares/validatorBrand.js";
import { valueJWT } from "../middlewares/valueJWT.js";
import { validateRole } from "../middlewares/validateRole.js";

const router = Router();

router.get(
    '/allBrands',
    valueJWT,
    validateRole("ADMIN"),
    getBrands
)

router.get(
    '/findBrand/:id',
    valueJWT,
    validateRole("ADMIN"),
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