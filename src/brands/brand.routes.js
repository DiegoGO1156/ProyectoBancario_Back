import { Router } from "express";
import { getBrands, getBrandsById, createBrand, updateBrand, deleteBrand } from "./brand.controller.js";

const router = Router();

router.get(
    '/allBrands',
    getBrands
)

router.get(
    '/findBrand/:id',
    getBrandsById
)

router.post(
    '/createBrand',
    createBrand
)

router.put(
    '/updateBrand/:id',
    updateBrand
)

router.delete(
    '/deleteBrand/:id',
    deleteBrand
)

export default router;