import { User } from "../models/user.models.js"
import { SubTask } from "../models/subTask.model.js"
import { Task } from "../models/task.model.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import asyncHandler from "../utils/asyn-handler.js"
import mongoose from "mongoose"
import { Project } from "../models/project.model.js"


const getTasks = asyncHandler(async(req, res)=>{
const {projectId} = req.params;
 const project = await projectId.findById(projectId)
    if (!project) {
        throw new ApiError(404, "Project not found")
    }

    const tasks= new Task.find({
       project: new mongoose.Types.ObjectId(projectId),
    }).populate("assignedTo", "avatar username fullName")
    return res.status(201).json(new ApiResponse(200, tasks  ,"Task fetched succesfully"))

})

const createTasks = asyncHandler(async(req, res)=>{
    const {title, description, assignedTo ,assignedBy, status} = req.body
    const {projectId} = req.params;

    const project = await Project.findById(projectId)
    if (!project) {
        throw new ApiError(404, "Project not found")
    }

   const files =  req.files || []

   files.map((files)=>{
    return {
        url:`${process.env.SERVER_URL}/images/${files.originalname}`,
        MimeType:files.mimetype,
        size:files.size
    }
   })

   const task = await Task.create({
    title,
    description,
    project: new mongoose.Types.ObjectId(projectId),
    assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo):undefined,
    status,
    assignedBy: new mongoose.Types.ObjectId(req.user._id),
    attachments 
   })
   return res.status(201).json(new ApiResponse(200, task ,"Task created succesfully"))

})

const getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params;

    const task = await Task.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subtasks",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "createdBy",
                            foreignField: "_id",
                            as: "createdBy",
                            pipeline: [
                                {
                                    $project: {
                                        _id: 1,
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            createdBy: {
                                $arrayElemAt: ["$createdBy", 0]
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                assignedTo: {
                    $arrayElemAt: ["$assignedTo", 0]
                }
            }
        }
    ]);

    if (!task || task.length === 0) {
        throw new ApiError(404, "Task not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task fetched successfully"));
});
const updateTasks = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const { taskId } = req.params

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid Task Id")
    }

    const updateData = {}

    if (name) updateData.name = name
    if (description) updateData.description = description

    const task = await Task.findByIdAndUpdate(
        taskId,
        updateData,
        { new: true, runValidators: true }
    )

    if (!task) {
        throw new ApiError(404, "Task not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task updated successfully"))
})

const deleteTasks = asyncHandler(async (req, res) => {

    const { taskId } = req.params

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid Task Id")
    }

    const task = await Task.findByIdAndDelete(taskId)

    if (!task) {
        throw new ApiError(404, "Task not found")
    }

    await SubTask.deleteMany({ task: taskId })

    return res
        .status(200)
        .json(new ApiResponse(200, task, "Task deleted successfully"))
})

const createSubTasks = asyncHandler(async(req, res)=>{
    const{taskId} = req.params
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new ApiError(400, "Invalid Task Id")
    }
    const task = await Task.findById(taskId)

    if (!task) {
        throw new ApiError(404, "Task not found")
    }
        const subtask = await SubTask.create({
        title,
        task: taskId,
        createdBy: req.user._id
    })

    return res
        .status(201)
        .json(new ApiResponse(201, subtask, "Subtask created"))
    
    
    

})

const updateSubTasks = asyncHandler(async(req, res)=>{
    const { title, isCompleted } = req.body
    const { subtaskId } = req.params

    if (!mongoose.Types.ObjectId.isValid(subtaskId)) {
        throw new ApiError(400, "Invalid subTask Id")
    }

    const updateData = {}

    if (title) updateData.title = title
    if (isCompleted) updateData.isCompleted = isCompleted

    const subTask = await SubTask.findByIdAndUpdate(
        subtaskId,
        updateData,
        { new: true, runValidators: true }
    )

    if (!subTask) {
        throw new ApiError(404, "Task not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subTask, "subTask updated successfully"))
})

const deleteSubTasks = asyncHandler(async(req, res)=>{
     const { subTaskId } = req.params

    if (!mongoose.Types.ObjectId.isValid(subTaskId)) {
        throw new ApiError(400, "Invalid SubTask Id")
    }

    const subtask = await SubTask.findByIdAndDelete(subTaskId)

    if (!subtask) {
        throw new ApiError(404, "Subtask not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, subtask, "Subtask deleted"))
})
export {
getTasks,
createTasks,
getTaskById,
updateTasks,
deleteTasks,
createSubTasks,
updateSubTasks,
deleteSubTasks,
}