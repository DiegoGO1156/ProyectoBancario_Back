import { Router } from "express";
import { listDataUser, updateDatauser, updatePassword, listUsersPending, activeUsers, deleteRegisterUser, editBalanceUser } from "./userController.js";
import { passwordValidatorMiddleware } from "../middlewares/validatorPasswords.js";
import { validatorListDataUser, validatorUpdatePassword, validatorUpdateUser } from "../middlewares/validatorUser.js";
import { validatorActiveUser, validatorDeleteRegisterUser, validatorListPending, validatorUpdateBalanceUser } from "../middlewares/validatorAdmin.js";

const router = Router()

router.get(
    "/personalData",
    validatorListDataUser,
    listDataUser
)

router.put(
    "/updateData",
    validatorUpdateUser,
    updateDatauser
)

router.put(
    "/updatePassword",
    validatorUpdatePassword,
    passwordValidatorMiddleware,
    updatePassword
)

//////////////////////////////////////////////////////////////////////////////////////// ADMINISTRADOR //////////////////////////////////////////////////////////////////////////////

router.get(
    "/pending",
    validatorListPending,
    listUsersPending
);

router.post(
    "/:id/activate",
    validatorActiveUser,
    activeUsers
);

router.delete(
    "/:id/delete",
    validatorDeleteRegisterUser,
    deleteRegisterUser
);

router.put(
    "/:id/edit-balance",
    validatorUpdateBalanceUser,
    editBalanceUser
);

export default router