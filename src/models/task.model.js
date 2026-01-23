import mongoose, {Schema} from "mongoose";
import { AvailableTaskStatusEnum } from "../utils/costants";


const taskSchema = new Schema({

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: AvailableTaskStatusEnum,
      default: "todo",
    },
},{timestamps:true})

export const Task = mongoose.model("Task",taskSchema)