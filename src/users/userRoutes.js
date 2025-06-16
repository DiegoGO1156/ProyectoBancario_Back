import { Router } from "express";
import { listDataUser, updateDatauser, updatePassword, listUsersPending, activeUsers, deleteRegisterUser, editBalanceUser } from "./userController.js";
import { passwordValidatorMiddleware } from "../middlewares/validatorPasswords.js";
import { valueJWT } from "../middlewares/valueJWT.js"

const router = Router()

router.get(
    "/personalData",
    valueJWT,
    listDataUser
)

router.put(
    "/updateData",
    valueJWT,
    updateDatauser
)

router.put(
    "/updatePassword/:id",
    valueJWT,
    passwordValidatorMiddleware,
    updatePassword
)

//////////////////////////////////////////////////////////////////////////////////////// ADMINISTRADOR //////////////////////////////////////////////////////////////////////////////

router.get(
    "/pending",
    listUsersPending
);

router.post(
    "/:id/activate",
    activeUsers
);

router.delete(
    "/:id/delete",
    deleteRegisterUser
);

router.put(
    "/:id/edit-balance",
    editBalanceUser
);

export default router