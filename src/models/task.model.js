import mongoose, { Schema } from "mongoose";
import { AvailableTaskStatus } from "../utils/costants.js";


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
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: AvailableTaskStatus,
    default: "todo",
  },
  attachments: {
    type: [{
      url: String,
      mimetype: String,
      size: Number,
    },
  ],
  default: [],
  },
},


  { timestamps: true })

export const Task = mongoose.model("Task", taskSchema)