import { User } from "../models/user.models.js"
import { Project } from "../models/project.model.js"
import { ProjectMember } from "../models/projectMember.model.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import asyncHandler from "../utils/asyn-handler.js"
import mongoose from "mongoose"
import { USerRolesEnum } from "../utils/costants.js"

const getProject = asyncHandler(async(req, res)=>{
    //test
})

const getProjectById = asyncHandler(async(req, res)=>{
    //test
})
const createProject = asyncHandler(async(req, res)=>{
    const{name, description}= req.body

    const project = await Project.create({
        name,
        description,
        createdBy:new mongoose.Types.ObjectId(req.user._id),
    })

    await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: USerRolesEnum.ADMIN
    })

    return res.status(201).json(new ApiResponse(201,project,"Project Created Successfully"))
})

const updateProject = asyncHandler(async(req, res)=>{
    const{name, description }= req.body

    const{projectId} = req.params

    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description
        },
        {new: true}
    )
    if(!project){
        throw new ApiError(404, "Project not found")
    }
    return res.status(200).json(new ApiResponse(201, project,"Project Updated Succesfully "))


})
const deleteProject = asyncHandler(async(req, res)=>{
    const {projectId} = re.params

    const project = Project.findByIdAndDelete(projectId)
    if(!project){
        throw new ApiError(404, "Project not found")
    }
     return res.status(200).json(new ApiResponse(201, project,"Project Deleted Succesfully "))

})

const addMembersToProject = asyncHandler(async(req, res)=>{
    //test
})
const updateMemberRole = asyncHandler(async(req, res)=>{
    //test
})

const deleteMember = asyncHandler(async(req, res)=>{
    //test
})
export{
    getProject,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    addMembersToProject,
    updateMemberRole,
    deleteMember
}