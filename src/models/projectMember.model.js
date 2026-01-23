import mongoose, {Schema} from "mongoose";
import { AvailableRolesEnum } from "../utils/costants.js";


const projectMember =new Schema ({
    user:{
        type:String,
        required:true,
        trim:true,
        unique:true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    role:{
        type:String,
        enum:AvailableRolesEnum,
        default:"member",
    },





},{timestamps:true})
export const ProjectMember = mongoose.model(
  "ProjectMember",
  projectMember
);