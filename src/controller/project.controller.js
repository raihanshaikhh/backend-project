import { User } from "../models/user.models.js"
import { Project } from "../models/project.model.js"
import { ProjectMember } from "../models/projectMember.model.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import asyncHandler from "../utils/asyn-handler.js"
import mongoose from "mongoose"
import { AvailableRolesEnum, USerRolesEnum } from "../utils/costants.js"

const getProject = asyncHandler(async (req, res) => {
    const project = await ProjectMember.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "projects",
                localField: "projects",
                foreignField: "_id",
                as: "projects",
                pipeline: [{
                    $lookup: {
                        from: "projectmembers",
                        localField: "_id",
                        foreignField: "projects",
                        as: "projectmembers"
                    }
                }, {
                    $addFields: {
                        members: {
                            $size: "$projectmembers"
                        }
                    }
                }
                ]
            }
        },

        {
            $unwind: "project"
        },
        {
            $project: {
                project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    members: 1,
                    createdAt: 1,
                    createdBy: 1
                },
                role: 1,
                _id: 0
            }
        }

    ])
    return res.status(200).json(new ApiResponse(200, project, "project fetched sucessfully"))
})

const getProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params

    const project = await Project.findById(projectId)

    if (!project) {
        throw new ApiError(404, "project not found")
    }
    return res.status(200).json(new ApiResponse(200, project, "project fetched sucessfully"))

})
const createProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id),
    })

    await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: USerRolesEnum.ADMIN
    })

    return res.status(201).json(new ApiResponse(201, project, "Project Created Successfully"))
})

const updateProject = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    const { projectId } = req.params

    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description
        },
        { new: true }
    )
    if (!project) {
        throw new ApiError(404, "Project not found")
    }
    return res.status(200).json(new ApiResponse(201, project, "Project Updated Succesfully "))


})
const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params

    const project = Project.findByIdAndDelete(projectId)
    if (!project) {
        throw new ApiError(404, "Project not found")
    }
    return res.status(200).json(new ApiResponse(201, project, "Project Deleted Succesfully "))

})

const addMembersToProject = asyncHandler(async (req, res) => {
    const { email, role } = req.body
    const { projectId } = req.params

    const user = await User.findOne({ email })
    if (!user) {
        throw new ApiError(404, "user not found")
    }
    await ProjectMember.findByIdAndUpdate({
        user: new mongoose.Types.ObjectId(user._id),
        project: new mongoose.Types.ObjectId(projectId),
    }, {
        user: new mongoose.Types.ObjectId(user._id),
        project: new mongoose.Types.ObjectId(projectId),
        role: role
    }, {
        new: true,
        upsert: true,
    }

    )
    return res.status(200).json(new ApiResponse(200, {}, "member added succesfully"))

})

const getProjectMembers = asyncHandler(async (req, res) => {
    const { projectId } = req.params

    const project = await Project.findById(req.params)
    if (!project) {
        throw new ApiError(404, "project not found")
    }

    const projectMembers = await ProjectMember.aggregate([{
        $match: {
            project: new mongoose.Types.ObjectId(projectId)
        }
    }, {
        $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
            pipeline: [{
                $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1
                }
            }]

        }
    },
    {
        $addFields:{
            user:{
                $arrayElemAt:["$user", 0]
            }
        }
    },{
        $project:{
            project:1,
            user:1,
            role:1,
            createdAt:1,
            updatedAt:1,
            _id:0
        }
    }

    ])
    return res.status(200).json(new ApiResponse(200, projectMembers, "member fetched succesfully"))

})
const updateMemberRole = asyncHandler(async (req, res) => {
    const {projectId, userId} = req.params
    const{newrole} = req.body

    if(!USerRolesEnum.includes(newrole)){
        throw new ApiError(404, "invalid role")
    }
    let projectMember = await ProjectMember.findOne(
        {project: new mongoose.Types.ObjectId(projectId)},
         {user: new mongoose.Types.ObjectId(userId)},
    )
    if(!projectMember){
        throw new ApiError(404, "project member not found")
    }

   projectMember =  await ProjectMember.findByIdAndUpdate(
        projectMember._id,{
            role: newrole
        },{new:true}
    )
    if(!projectMember){
        throw new ApiError(404, "project member not found")
    }
 return res.status(200).json(new ApiResponse(200, projectMember, "role updated succesfully"))

})

const deleteMember = asyncHandler(async (req, res) => {
       const {projectId, userId} = req.params


   
    let projectMember = await ProjectMember.findOne(
        {project: new mongoose.Types.ObjectId(projectId)},
         {user: new mongoose.Types.ObjectId(userId)},
    )
    if(!projectMember){
        throw new ApiError(404, "project member not found")
    }

   projectMember =  await ProjectMember.findByIdAndDelete(
        projectMember._id
    )
    if(!projectMember){
        throw new ApiError(404, "project member not found")
    }
 return res.status(200).json(new ApiResponse(200, projectMember, "member removed succesfully"))
})
export {
    getProject,
    getProjectById,
    getProjectMembers,
    createProject,
    updateProject,
    deleteProject,
    addMembersToProject,
    updateMemberRole,
    deleteMember
}