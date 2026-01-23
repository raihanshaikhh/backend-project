import mongoose, {Schema} from "mongoose";


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
      enum: AvailableTaskStatusEnum,
      default: "todo",
    },
  isCompleted:{
    boolean:false
  }



},{timestamps:true})

export const SubTask = mongoose.model("SubTask", subTaskSchema);