import { Router } from "express";
import { getServices, getServicesBydId, createService, updateService, deleteService } from "./service.controller.js";

const router = Router();

router.get(
    '/allServices',
    getServices
)

router.get(
    '/findService/:id',
    getServicesBydId
)

router.post(
    '/createService',
    createService
)

router.put(
    '/updateService/:id',
    updateService
)

router.delete(
    '/deleteService/:id',
    deleteService
)

export default router;