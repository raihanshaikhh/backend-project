import { Router } from "express";
import {userRegister} from "../controller/userAuth.controller.js"
const router = Router()

router.route("/register").post(userRegister)

export default router;