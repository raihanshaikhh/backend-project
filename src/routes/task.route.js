import { Router } from "express";
import {
    getTasks,
    createTasks,
    getTaskById,
    updateTasks,
    deleteTasks,
    createSubTasks,
    updateSubTasks,
    deleteSubTasks
} from "../controller/task.controller.js"
import { verifyJWT } from "../middlewares/auth.midleware.js";
const router = Router()

router.use(
   "/projects/:projectId/tasks",
   verifyJWT,
   createTasks
)

router.get("/projects/:projectId/tasks", getTasks)

router.post("/projects/:projectId/tasks", createTasks)

router.get("/tasks/:taskId", getTaskById)

router.patch("/tasks/:taskId", updateTasks)

router.delete("/tasks/:taskId", deleteTasks)
router.post("/tasks/:taskId/subtasks", createSubTasks)

router.patch("/subtasks/:subtaskId", updateSubTasks)

router.delete("/subtasks/:subtaskId", deleteSubTasks)
export default router;
