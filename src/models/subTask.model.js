import mongoose, {Schema} from "mongoose";
import {AvailableTaskStatus} from "../utils/costants.js"


const subTaskSchema = new Schema({
task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: AvailableTaskStatus,
      default: "todo",
    },
  isCompleted: {
  type: Boolean,
  default: false
}



},{timestamps:true})

export const SubTask = mongoose.model("SubTask", subTaskSchema);