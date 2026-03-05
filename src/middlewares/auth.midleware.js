/*we are wtiting this code because when client
communicate with server it has to give accesstoken to
get a response from server and with every new request server has
to check that its a verified accesstoken
*/ 

import jwt from "jsonwebtoken"
import { ApiError } from "../utils/api-error.js"
import { User } from "../models/user.models.js"
import {ProjectMember} from "../models/projectMember.model.js"
import asyncHandler from "../utils/asyn-handler.js"
import mongoose from "mongoose"
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

export const validateProjectPermission = (roles = []) => {
  return asyncHandler(async (req, res, next) => {

    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(400, "project id is missing");
    }

    const projectMember = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),
      user: new mongoose.Types.ObjectId(req.userId)
    });

    if (!projectMember) {
      throw new ApiError(404, "project not found for this user");
    }

    const givenRole = projectMember.role;

    req.userRole = givenRole;

    if (roles.length && !roles.includes(givenRole)) {
      throw new ApiError(403, "you do not have permission");
    }

    next();
  });
};