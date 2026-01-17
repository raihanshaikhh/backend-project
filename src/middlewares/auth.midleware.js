/*we are wtiting this code because when client
communicate with server it has to give accesstoken to
get a response from server and with every new request server has
to check that its a verified accesstoken
*/ 

import jwt from "jsonwebtoken";
import{ ApiError }from "../utils/api-error.js";
import {User} from "../models/user.models.js"
import { asyncHandler } from "../utils/asyn-handler.js"

export const verifyJWT =asyncHandler (async (req, res, next)=>{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if(!token){
        throw new ApiError(401,"unautorized request")
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry")
        if(!decodedToken){
        throw new ApiError(401,"invalid accesstoken")
       
    }
     req.user = user
        next()

    } catch (error) {
        throw new ApiError(401,"invalid accesstoken")
    }


})

