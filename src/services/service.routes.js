import { Router } from "express";
import { getServices, getServicesBydId, createService, updateService, deleteService } from "./service.controller.js";
import { validatorCreateService, validatorUpdateService, validatorDeleteService } from "../middlewares/validatorService.js";
import { valueJWT } from "../middlewares/valueJWT.js";

const router = Router();

router.get(
    '/allServices',
    valueJWT,
    getServices
)

router.get(
    '/findService/:id',
    valueJWT,
    getServicesBydId
)

router.post(
    '/createService',
    validatorCreateService,
    createService
)

router.put(
    '/updateService/:id',
    validatorUpdateService,
    updateService
)

router.delete(
    '/deleteService/:id',
    validatorDeleteService,
    deleteService
)

export default router;