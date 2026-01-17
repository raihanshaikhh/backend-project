import { Router } from "express";
import {loginUser, userRegister, logOut} from "../controller/userAuth.controller.js"
import { validate } from "../middlewares/vlidators.middleware.js";
import { userRegistorValidator,loginUserValidator } from "../validators/index.js";
import {verifyJWT} from "../middlewares/auth.midleware.js"



const router = Router()

router.route("/register").post(userRegistorValidator(), validate, userRegister)
router.route("/login").post(loginUserValidator(),validate,loginUser)
//secure route
router.route("/logout").post(verifyJWT, logOut)


export default router;