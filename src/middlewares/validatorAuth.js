import { body } from "express-validator";
import { validarCampos } from "./validarCampos.js"
import { emailUsed, minincome, usedUsername } from "../helpers/db-Validator.js";

export const registerValidator =[
    body("name", "The name is required").not().isEmpty(),
    body("username", "The username is required").not().isEmpty(),
    body("username").custom(usedUsername),
    body("dpi", "The DPI is required").not().isEmpty(),
    body("address", "The address is required").not().isEmpty(),
    body("phone", "The phone is required").not().isEmpty(),
    body("email", "The email is required").not().isEmpty(),
    body("email").custom(emailUsed),
    body("password", "The password is required").notEmpty().isLength({min: 8}).withMessage("The minimum number of characters in the password must be 8"),
    body("companyName", "The company Name is required").not().isEmpty(),
    body("income", "The income is required").notEmpty(),
    body("income", "The income is required").custom(minincome),
    validarCampos
]