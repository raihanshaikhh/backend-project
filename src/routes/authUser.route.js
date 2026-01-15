import { Router } from "express";
import {userRegister} from "../controller/userAuth.controller.js"
import { validate } from "../middlewares/vlidators.middleware.js";
import { userRegistorValidator } from "../validators/index.js";




const router = Router()

router.route("/register").post(userRegistorValidator(), validate, userRegister)

export default router;