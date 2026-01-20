/*we are wtiting this code because when client
communicate with server it has to give accesstoken to
get a response from server and with every new request server has
to check that its a verified accesstoken
*/ 

import jwt from "jsonwebtoken"
import { ApiError } from "../utils/api-error.js"
import { User } from "../models/user.models.js"
import asyncHandler from "../utils/asyn-handler.js"

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization
  const token =
    req.cookies?.accessToken ||
    authHeader?.split(" ")[1]

  if (!token) {
    throw new ApiError(401, "unauthorized request")
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    )

    const user = await User.findById(decodedToken._id)
      .select("-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry")

    if (!user) {
      throw new ApiError(401, "User not found")
    }

    req.user = user
    next()
  } catch (error) {
    console.error("JWT error:", error.message)
    throw new ApiError(401, "invalid accesstoken")
  }
})
