import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto"
import jwt from "jsonwebtoken";


const userSchema = new Schema({
    avatar:{
        //this is for image image are kept in like aws or some other serber but ,ost of the time its in string
        type:{
            url:String, // url of image and its type will be string
            localPath:String // local path of image
        },
        default:{
            url:`https://placehold.co/200`,
            localPath:""
        }

    },
    username:{
        type:String,
        required:true,
        unique:true,
        lowecase:true,
        trim:true,
        index:true

    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    fullName:{
        type:String,
        trim:true
    },
    password:{
        type: String,
        required:[true,"password is required"]
    },
    isEmailVerified:{
        type:Boolean,
        default:false

    },
    refreshToken:{
        type:String
    },
    ForogotPasswordToken:{
        type: String
    },
    ForogotPasswordTokenExpiry:{
        type: Date
    },
    emailVerificationToken:{
        type:String
    },
    emailVerificationTokenExpiry:{
        type:Date
    }
},{
timeStamps:true
}
)
/*userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next() //this condition make sure that the password is only encrypted when it is modified or user entering for the first time
    this.password = await bcrypt.hash(this.password, 10)
     // you define what u want to encrypt and for how many rounds of hashing here we use 10
    next()
    })
*/
userSchema.pre("save", async function () {
    console.log("PRE SAVE RUNNING")
    if (!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password, 10)
})

    //checking if the enterd password is correct while loging in

    userSchema.methods.isPasswordCorrect = async function (password) {
        return await bcrypt.compare(password, this.password)
    }

//creating JWT tokens acess and refresh tokens by installing npm lib jasonwebtokens

userSchema.methods.generateAcessTokens = function(){
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
    }
    )
}
userSchema.methods.generateRefreshTokens = function(){
     return jwt.sign({
        _id: this._id,
       
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
    }
    )
}
//generating temporary tokens

userSchema.methods.generateTemporayTokens = function () {
    const unhashedTokens = crypto.randomBytes(20).toString("hex")

    const hashedTOkens = crypto.
    createHash("sha256")
    .update(unhashedTokens)
    .digest("hex")

    const tokenExpiry = Date.now() + (20*60*1000) //20mins

    return {unhashedTokens, hashedTOkens, tokenExpiry}
}
export const User = mongoose.model("User", userSchema)