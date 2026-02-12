import mongoose, {Schema} from "mongoose";
import { AvailableRolesEnum, USerRolesEnum } from "../utils/costants.js";


const projectMember =new Schema ({
    user:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true,
        trim:true,

    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    role:{
        type:String,
        enum:AvailableRolesEnum,
        default:USerRolesEnum.MEMBER,
    },





},{timestamps:true})
export const ProjectMember = mongoose.model(
  "ProjectMember",
  projectMember
);