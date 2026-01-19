
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import asyncHandler from "../utils/asyn-handler.js"
import { emailSend, emailVerificationTemplate } from "../utils/mail.js"
import jwt from "jasonwebtoken"



const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAcessTokens()
        const refreshToken = user.generateRefreshTokens()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        console.error("TOKEN ERROR:", error);
        throw new ApiError(500, "failed to genrate generate tokens")
    }
}


const userRegister = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body

    const esixtingUser = await User.findOne({ // finding in db
        $or: [{ username }, { email }] //checking with db if anyone is already existed
    })

    if (esixtingUser) {
        throw new ApiError(409, "email or username already exist", [])
    }


    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false,
    })

    const { unhashedTokens, hashedTOkens, tokenExpiry } = user.generateTemporayTokens()

    user.emailVerificationToken = hashedTOkens
    user.emailVerificationTokenExpiry = tokenExpiry

    await user.save({ validateBeforeSave: false })


    await emailSend({
        email: user.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationTemplate(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedTokens}`
        )
    })


    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry"
    )

    if (!createdUser) {
        throw new ApiError(500, "something went wromng while registrating user")

    }

    return res.status(201)
        .json(
            new ApiResponse(200, {
                user: createdUser
            },
                "user registered succesfully and verification email has been sent")
        )

})


const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if (!email) {
        throw new ApiError(402, "Email or USername is Required")
    }

    //if user already exist

    const user = await User.findOne({ email })  //finding by email

    if (!user) {
        throw new ApiError(401, "user does not exist")
    }

    //if user existed checking password

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(403, "invalid password")
    }
    console.log("User ID:", user._id);
    console.log("Has methods:",
        typeof user.generateAccessTokens,
        typeof user.generateRefreshTokens
    );

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry"
    )
    //creating cookies

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshtoken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
                "user logged in succesfully")
        )


})

//loggin out user

const logOut = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: ""
        },

    },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshtoken", options)
        .json(
            new ApiResponse(200, {}, "user loggedout succesfully")
        )

})

// getting current user 

const currenUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200, req.user, "user fetched successfully"
            )
        )
})
//verifying email
const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params

    if (!verificationToken) {
        throw new ApiError(401, "verification token not found")
    }
    let hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex")

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiry: { $gt: Date.now() }
    })
    if (!user) {
        throw new ApiError(401, "token expired")

    }

    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;


    user.isEmailVerified = true
    await user.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(200, {
            isEmailVerified: true
        }, "Email is verified")
    )
})
// resnding email

const resendEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(400, "user does not exist")
    }
    if (user.isEmailVerified) {
        throw new ApiError(401, "email already verified")
    }
    const { unhashedTokens, hashedTOkens, tokenExpiry } = user.generateTemporayTokens()

    user.emailVerificationToken = hashedTOkens
    user.emailVerificationTokenExpiry = tokenExpiry

    await user.save({ validateBeforeSave: false })


    await emailSend({
        email: user.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationTemplate(
            user.username,
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedTokens}`
        )
    })
    return res.status(200).json(new ApiResponse(200, "Mail has been sent successfully"))
})
// refreshing accesstoken

const refreshAccessToken = asyncHandler(async (req, res)=>{
      const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
        if(!incomingRefreshToken){
            throw new ApiError(401,"unautorized access")
        }
        try {
           const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
           const user =await User.findById(decodedToken?._id)
           if(!user){
            throw new ApiError(404,"invalid refresh token")

           }

           if(incomingRefreshToken !== user?.refreshToken){
             throw new ApiError(404,"refresh token is expired")
           }

           const options = {
            httpOnly:true,
            secure:true
           }

           const {accessToken, refreshToken:newRefreshToken }=await generateAccessAndRefreshTokens(user._id)

           user.refreshToken = newRefreshToken;
           await user.save()

           return res.status(200).cookie("accessToken",accessToken,options).cookie("refeshToken",newRefreshToken,options).json(
            new ApiResponse(200,{
                accessToken, refreshToken:newRefreshToken,
            },"AccessoToken Refreshed")
           )

        } catch (error) {
            throw new ApiError(404,"refresh token is expired")
        }

})

//forgot password request

const forgotPasswordRequest = asyncHandler(async(req, res)=>{
    const {email}  = req.body

    const user = user.findOne({email})

    if (!user){
        throw new ApiError(404,"user does not exist",[])
    }

    const{unhashedTokens,hashedTOkens, tokenExpiry}=user.generateTemporayTokens()

    user.ForogotPasswordToken = hashedTOkens;
    user.ForogotPasswordTokenExpiry= tokenExpiry

    await user.save({validateBeforeSave:false})

    await emailSend({
        email: user.email,
        subject: "Reset Your Password",
        mailgenContent: passwordResetTemplate(
            user.username,
            `${process.env.FORGOT_PASSWORD_URL}/${unhashedTokens}`
        )
    })
    return res.status(200).json(new ApiResponse(
        200,{},"Password reset mail has benn sent successfully"
    ))


})

const resetForgotPassword = asyncHandler(async(req, res)=>{
    const {resetToken} = req.params
    const {newPassword} = req.body

    let hashedToken = crypto
    .createHash("sha256")
    .update(resetToken).digest("hex")

    const user = await User.findOne({
        ForogotPasswordToken: hashedToken,
        ForogotPasswordTokenExpiry: {$gt: Date.now()}})

        if(!user){
            throw new ApiError(402,"token invalid or expired")

        }

        user.ForogotPasswordTokenExpiry = undefined
        user.ForogotPasswordToken= undefined
        
        user.password = newPassword

        await user.save({validateBeforeSave: false})

        return res.status(200).json(new ApiResponse(200,{},"password reset succesfully"))

})



//change password

const changePassword = asyncHandler(async(req, res)=>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)

   const isPasswordValid = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordValid){
    throw new ApiError(400,"Invalid old password")
   }

   user.password = newPassword
   await user.save({validateBeforeSave:false})

   return res.status(200).json(new ApiResponse(200,{},"Password changed successfully"))
})


export {
    userRegister, loginUser, logOut, currenUser, verifyEmail, resendEmail, refreshAccessToken, forgotPasswordRequest,changePassword, resetForgotPassword
}










// http://localhost:8000/api/v1/users/verify-email/2f856caeb917eee25f6c2c2e4deb7c7a18507d33