import { Router } from "express";
import { listDataUser, updateDatauser, updatePassword, listUsersPending, activeUsers, deleteRegisterUser, editBalanceUser, editStatusUser, listUsersActiveUsers } from "./userController.js";
import { passwordValidatorMiddleware } from "../middlewares/validatorPasswords.js";
import { validatorListDataUser, validatorUpdatePassword, validatorUpdateUser } from "../middlewares/validatorUser.js";
import { validatorActiveUser, validatorDeleteRegisterUser, validatorListPending, validatorUpdateBalanceUser, validatorUpdateStatusUser } from "../middlewares/validatorAdmin.js";


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
    "/updatePassword/:id",
    passwordValidatorMiddleware,
    updatePassword
)
//////////////////////////////////////////////////////////////////////////////////////// ADMINISTRADOR //////////////////////////////////////////////////////////////////////////////

router.get(
    "/pending",
    validatorListPending,
    listUsersPending
);

router.get(
    "/active",
    validatorListPending,
    listUsersActiveUsers
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

router.put(
    "/changeStatusUser/:id",
    validatorUpdateStatusUser,
    editStatusUser
)
export default router