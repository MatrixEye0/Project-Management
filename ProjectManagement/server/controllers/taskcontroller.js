import prisma from "../configs/prisma.js";
import { inngest } from "../inngest/index.js";

// create task 
export const createTask = async (req, res)=>{
    try{
         const {userId} = await req.auth();
         const {projectId, title, description, type, status, priority, assigneeId, due_date} = req.body;
         const origin = req.get('origin')
         const dueDate = new Date(due_date);

         if (!projectId || !title?.trim() || !assigneeId || !due_date || Number.isNaN(dueDate.getTime())) {
            return res.status(400).json({ message: "Title, project, assignee, and a valid due date are required" });
         }

         // check user is admin role
         const project = await prisma.project.findUnique({
            where:{id: projectId},
            include:{members:{include:{user:true}}}
         })
         if(!project){
            return res.status(404).json({message:"Project not found"})
         }else if(project.team_lead !== userId){
            return res.status(404).json({message:"not have ADMIN level power in project"})
         }else if(assigneeId && !project.members.find((member)=>member.user.id === assigneeId)){
            return res.status(403).json({message:"Assignee is not member of project"});
         }

         const task = await prisma.task.create({
            data:{
                projectId,
                title,
                description,
                type,
                priority,
                assigneeId,
                status,
                due_date: dueDate
            }
         })

         const taskWithAssignee = await prisma.task.findUnique({
            where:{id: task.id},
            include: {assignee: true}
         })

         await inngest.send({
            name:"app/task.assigned",
            data:{
               taskId: task.id, origin
            }
         })

         res.json({task: taskWithAssignee, message: "Task create successfully"})

    }catch(e){
       console.log(e);
       res.status(500).json({message: e.code || e.message});
    }
}

// update task

export const updateTask = async (req, res)=>{
    try{

         const task = await prisma.task.findUnique({
            where:{id: req.params.id}
         })
         if(!task){
            return res.status(404).json({message: "Task not found"});
         }
         const {userId} = await req.auth();

         // check user is admin role
         const project = await prisma.project.findUnique({
            where:{id: task.projectId},
            include:{members:{include:{user:true}}}
         })
         if(!project){
            return res.status(404).json({message:"Project not found"})
         }else if(project.team_lead !== userId){
            return res.status(404).json({message:"not have ADMIN level power in project"})
         }
         const updatedTask = await prisma.task.update({
             where:{id: req.params.id},
             data: req.body
         })

         res.json({task: updatedTask, message: "Task updated successfully"})

    }catch(e){
       console.log(e);
       res.status(500).json({message: e.code || e.message});
    }
}

// delete task 

export const deleteTask = async (req, res)=>{
    try{

         const {userId} = await req.auth();
         const {tasksIds} = req.body
         if (!Array.isArray(tasksIds) || tasksIds.length === 0) {
            return res.status(400).json({ message: "Select at least one task" });
         }
         const tasks = await prisma.task.findMany({
            where:{id:{in:tasksIds}}
         })

         if(tasks.length !== new Set(tasksIds).size){
            return res.status(400).json({message:"Task not found"});
         }
         if (new Set(tasks.map((task) => task.projectId)).size !== 1) {
            return res.status(400).json({ message: "Tasks must belong to the same project" });
         }
         // check user is admin role
         const project = await prisma.project.findUnique({
            where:{id: tasks[0].projectId},
            include:{members:{include:{user:true}}}
         })
         if(!project){
            return res.status(404).json({message:"Project not found"})
         }else if(project.team_lead !== userId){
            return res.status(403).json({message:"You do not have permission to delete tasks"})
         }
        
         await prisma.task.deleteMany({
            where:{id:{in:tasksIds}}
         })
         res.json({ message: "Task deleted successfully"})

    }catch(e){
       console.log(e);
       res.status(500).json({message: e.code || e.message});
    }
}