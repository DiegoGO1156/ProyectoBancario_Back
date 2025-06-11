import { Router } from "express"
import { check } from "express-validator"
import { validarCampos } from "../middlewares/validarCampos.js"
import {addTransfer, completeTransfer, denyTransfer, getTransferences, getTransferencesByUser} from "../transfers/transfer.controller.js"

const router = Router()
router.post(
    "/make-transfer/",
    [
        validarCampos
    ],
    addTransfer
)

router.get("/complete", completeTransfer)
router.get("/deny", denyTransfer)

router.get("/get-user/:id", getTransferencesByUser)

router.get("/get/", getTransferences)

export default router