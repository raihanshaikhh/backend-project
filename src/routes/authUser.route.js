import { Router } from "express";
import {loginUser, userRegister} from "../controller/userAuth.controller.js"
import { validate } from "../middlewares/vlidators.middleware.js";
import { userRegistorValidator,loginUserValidator } from "../validators/index.js";




const router = Router()

router.route("/register").post(userRegistorValidator(), validate, userRegister)
router.route("/login").post(loginUserValidator(),validate,loginUser)

export default router;