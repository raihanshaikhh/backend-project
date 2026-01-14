
import { User }from "../models/user.models.js"
import{ ApiError }from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import asyncHandler from "../utils/asyn-handler.js"
import {emailSend, emailVerificationTemplate} from "../utils/mail.js"



const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAcessTokens()
        const refreshToken = user.generateRefreshTokens()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Cannot generate tokens")
    }
}


const userRegister = asyncHandler(async (req, res)=>{
    const{email, username ,password, role}= req.body

   const esixtingUser = await User.findOne({ // finding in db
        $or:[{username}, {email}] //checking with db if anyone is already existed
    })

    if (esixtingUser){
        throw new ApiError(409,"email or username already exist",[])
    }


    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false,
    })

    const{unhashedTokens, hashedTOkens, tokenExpiry}=user.generateTemporayTokens()

    user.emailVerificationToken = hashedTOkens
    user.emailVerificationTokenExpiry = tokenExpiry

    await user.save({validateBeforeSave: false})


 await emailSend({
    email: user.email,
    subject: "Please verify your email",
    mailgenContent: emailVerificationTemplate(
        user.username,
        `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedTokens}`
    )
})


const createdUser =await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry"
)

if(!createdUser){
    throw new ApiError(500,"something went wromng while registrating user")

}

return res.status(201)
.json(
    new ApiResponse(200,{
        user:createdUser
    },
"user registered succesfully and verification email has been sent")
)

})
export {
    userRegister
}










// http://localhost:8000/api/v1/users/verify-email/2f856caeb917eee25f6c2c2e4deb7c7a18507d33