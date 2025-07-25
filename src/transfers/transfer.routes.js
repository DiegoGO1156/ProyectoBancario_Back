import { Router } from "express"
import { check } from "express-validator"
import { validarCampos } from "../middlewares/validarCampos.js"
import {addTransfer, buyProduct, completePayService, completePurchase, getFavoriteUsers,completeTransfer, denyPayment, denyPurchase, denyTransfer, getTransferences, getTransferencesByUser, listUserTransfered, makeAUserFavorite, payService} from "../transfers/transfer.controller.js"

const router = Router()
router.post(
    "/make-transfer/",
    [
        validarCampos
    ],
    addTransfer
)

router.post(
    "/buy-product/:id",
    buyProduct
)

router.post(
    "/pay-service/:id",
    payService
)

router.get("/complete", completeTransfer)
router.get("/deny", denyTransfer)

router.get("/completePurchase", completePurchase)
router.get("/denyPurchase", denyPurchase)

router.get("/completePayment", completePayService)
router.get("/denyPayment", denyPayment)

router.get("/get-user/:id", getTransferencesByUser)

router.get("/get/", getTransferences)

router.get("/get-user-transfered/", listUserTransfered)

router.get('/favorites', getFavoriteUsers);

router.put("/favorite", makeAUserFavorite)

export default router