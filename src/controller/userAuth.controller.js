
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
        console.error("TOKEN ERROR:", error);
        throw new ApiError(500, "failed to genrate generate tokens")
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


const loginUser = asyncHandler(async (req, res)=>{
 const{email, username ,password}= req.body

 if(!email){
    throw new ApiError(402,"Email or USername is Required")
 }

 //if user already exist

 const user = await User.findOne({email})  //finding by email

 if(!user){
    throw new ApiError(401,"user does not exist")
 }

 //if user existed checking password

 const isPasswordValid = await user.isPasswordCorrect(password)

 if(!isPasswordValid){
    throw new ApiError(403,"invalid password")
 }
console.log("User ID:", user._id);
console.log("Has methods:",
  typeof user.generateAccessTokens,
  typeof user.generateRefreshTokens
);

const {accessToken, refreshToken}= await generateAccessAndRefreshTokens(user._id)
const loggedInUser =await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry"
)
    //creating cookies

    const options={
        httpOnly:true,
        secure:process.env.NODE_ENV === "production"
    }
    return res.status(200)
    .cookie("accessToken", accessToken,options)
    .cookie("refreshtoken", refreshToken, options)
    .json(
        new ApiResponse(200,{
            user:loggedInUser,
            accessToken,
            refreshToken
        },
            "user logged in succesfully")
    )


})

//loggin out user

const logOut = asyncHandler(async(req, res)=>{
    
    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken:""
        },
        
    },
    {
        new:true
    }
)

const options ={
    httpOnly:true,
    secure:true
}
return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshtoken", options)
    .json(
        new ApiResponse(200,{},"user loggedout succesfully")
    )

})



export {
    userRegister, loginUser, logOut
}










// http://localhost:8000/api/v1/users/verify-email/2f856caeb917eee25f6c2c2e4deb7c7a18507d33