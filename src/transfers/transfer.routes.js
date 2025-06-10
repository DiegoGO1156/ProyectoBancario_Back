import { Router } from "express"
import { check } from "express-validator"
import { validarCampos } from "../middlewares/validarCampos.js"
import {addTransfer, completeTransfer} from "../transfers/transfer.controller.js"

const router = Router()

// router.get("/", getHotels)

// router.get(
//     "/get-hotel-by-id/:id",
//     [
//         check("id").custom(existeHotelById)
//     ],
//     getHotelById
// )

// router.get(
//     "/get-hotel-by-name/:name",
//     [
//         check("name").custom(existeHotelByName)
//     ],
//     getHotelByName
// )

// router.delete(
//     "/delete-hotel/:id",
//     [
//         check("id").custom(existeHotelById)
//     ],
//     deleteHotel
// )

router.post(
    "/make-transfer/",
    [
        validarCampos
    ],
    addTransfer
)

router.get("/complete", completeTransfer)
// router.put(
//     "/update-hotel/:id",
//     [
//         validarCampos,
//         deleteFileOnError,
//         check("id").custom(existeHotelById)
//     ],
//     updateHotel
// )

export default router