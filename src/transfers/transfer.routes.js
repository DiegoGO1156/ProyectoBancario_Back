import { Router } from "express"
import { check } from "express-validator"
import { validarCampos } from "../middlewares/validarCampos.js"
import {addTransfer, completeTransfer, denyTransfer, getTransferences, getTransferencesByUser, listUserTransfered, makeAUserFavorite} from "../transfers/transfer.controller.js"

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

router.get("/get-user-transfered/", listUserTransfered)

router.put("/favorite/:number", makeAUserFavorite)

export default router