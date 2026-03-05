import { Router } from "express";
import {getProject,
    getProjectById,
    getProjectMembers,
    createProject,
    updateProject,
    deleteProject,
    addMembersToProject,
    updateMemberRole,
    deleteMember} from "../controller/project.controller.js";
    
import { validate } from "../middlewares/vlidators.middleware.js";
import { createProjectValidator, addMembertoprojectValidator } from "../validators/index.js";
import {verifyJWT, validateProjectPermission } from "../middlewares/auth.midleware.js"
import { AvailableUserRole, UserRolesEnum } from "../utils/costants.js";


const router = Router()

router.use(verifyJWT)

router.route("/")
.get(getProject)
.post(createProjectValidator(), validate, createProject)

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableUserRole), getProjectById)
  .put(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    createProjectValidator(),
    validate,
    updateProject,
  )
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteProject);

router
  .route("/:projectId/members")
  .get(getProjectMembers)
  .post(
    validateProjectPermission([UserRolesEnum.ADMIN]),
    addMembertoprojectValidator(),
    validate,
    addMembersToProject,
  );

router
  .route("/:projectId/members/:userId")
  .put(validateProjectPermission([UserRolesEnum.ADMIN]), updateMemberRole)
  .delete(validateProjectPermission([UserRolesEnum.ADMIN]), deleteMember);




export default router;