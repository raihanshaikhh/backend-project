import { Router } from "express";
import {loginUser, userRegister, logOut, verifyEmail, refreshAccessToken, forgotPasswordRequest, resetForgotPassword, currentUser, changePassword, resendEmail} from "../controller/userAuth.controller.js"
import { validate } from "../middlewares/vlidators.middleware.js";
import { userRegistorValidator,loginUserValidator,userForgotPasswordValidator,userResetForgotPasswordValidator,userChangePasswordValidator } from "../validators/index.js";
import {verifyJWT} from "../middlewares/auth.midleware.js"



const router = Router()
//unsecured route
router.route("/register").post(userRegistorValidator(), validate, userRegister)
router.route("/login").post(loginUserValidator(),validate,loginUser)
router.route("/verify-email/:verificationToken").get(verifyEmail)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/forgot-password").get(userForgotPasswordValidator(),validate, forgotPasswordRequest)
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(),validate,resetForgotPassword)



//secure route
router.route("/logout").post(verifyJWT, logOut)
router.route("/current-user").get(verifyJWT, currentUser)
router.route("/change-password").post(verifyJWT,userChangePasswordValidator(), validate, changePassword )
router.route("/resend-email-verification").post(verifyJWT, resendEmail)


export default router;