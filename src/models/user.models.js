import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";

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

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next() //this condition make sure that the password is only encrypted when it is modified or user entering for the first time
    await bcrypt.hash(this.password, 10)
     // you define what u want to encrypt and for how many rounds of hashing here we use 10
    next()
    })


    //checking if the enterd password is correct while loging in

    userSchema.methods.isPasswordCorrect(async function (password) {
        return await bcrypt.compare(password, this.password)
    })

export const user = mongoose.model("User", userSchema)