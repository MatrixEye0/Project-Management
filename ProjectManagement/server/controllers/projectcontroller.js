// create project
import prisma from "../configs/prisma.js";

export const createProject = async (req, res)=>{
    try{
         const{userId} = await req.auth();
         const {workspaceId, description, name, status, start_date, end_date, team_members, team_lead, progress, priority} = req.body;
         // check user has admin role in organization
         const workspace = await prisma.workspace.findUnique({
            where:{id: workspaceId},
            include: {members:{include:{user:true}}}
         })
         if(!workspace){
            return res.status(404).json({message: "Organization not found"})
         }
         if(!workspace.members.some((member)=>member.userId === userId && member.role === 'ADMIN'))
         {
             return res.status(404).json({message: "Not permission to create project in this organization"})
         }

         // get team lead using email
         const teamLead = workspace.members.find((member) => member.user.email === team_lead)?.user;
         if (!teamLead) {
            return res.status(400).json({ message: "Select a project lead from this workspace" });
         }
         const project = await prisma.project.create({
            data:{
                workspaceId,
                name,
                description,
                status,
                priority,
                progress,
                team_lead: teamLead.id,
                start_date: start_date ? new Date(start_date) : null,
                end_date: end_date ? new Date(end_date) : null
            }
         })

         // add member to project if they are in organization
         const membersToAdd = new Set(
            workspace.members
                .filter((member) => team_members?.includes(member.user.email))
                .map((member) => member.user.id)
         );
         membersToAdd.add(teamLead.id);
         await prisma.projectMember.createMany({
            data: [...membersToAdd].map((memberId) => ({
                projectId: project.id,
                userId: memberId
            })),
            skipDuplicates: true
         });

         const projectWithMembers = await prisma.project.findUnique({
            where:{id: project.id},
            include:{
                members:{include:{user: true}},
                tasks:{include: {assignee: true, comments:{include:{user: true}}}},
                owner: true
            }
         })

         res.json({project: projectWithMembers, message: "Project created successfully"})

    }catch(e){
       console.log(e);
       res.status(500).json({message: e.code || e.message})
    }
} 

// update project
export const updateProject = async (req, res)=>{
    try{
        const {userId} = await req.auth();
        const { id } = req.params;
        const { workspaceId, description, name, status, start_date, end_date, progress, priority}= req.body;
         

        const existingProject = await prisma.project.findUnique({
            where: { id }
        });

        if (!existingProject) {
            return res.status(404).json({ message: "Project not found" });
        }

         const workspace = await prisma.workspace.findUnique({
            where:{id: workspaceId},
            include: {members:{include:{user:true}}}
         })

         if(!workspace){
            return res.status(404).json({message: "Organization not found"});
         }
         if(!workspace.members.some((member)=>member.userId === userId && member.role ==='ADMIN')){
            const project = await prisma.project.findUnique({
                where: {id}
            })
            if(!project){
                return res.status(404).json({message: "Project not found"});
            }else if(project.team_lead !== userId){
                 return res.status(403).json({message:"Not permisssion to update project in this organization"});
            }
         }

         const project = await prisma.project.update({
            where: {id},
            data:{
                workspaceId,
                description,
                name,
                status,
                priority,
                progress,
                start_date: start_date ? new Date(start_date) : null,
                end_date: end_date ? new Date(end_date) : null
            }
         })
         res.json({project, message:"Project updated successfully"})

    }catch(e){
       console.log(e);
       res.status(500).json({message: e.code || e.message})
    }
}

// add member to project
export const addMember = async (req, res)=>{
    try{
         const {userId} = await req.auth();
         const {projectId} = req.params;
         const {email} = req.body;
         if (!email) {
            return res.status(400).json({ message: "Member email is required" });
         }

         //check user is project lead 
         const project = await prisma.project.findUnique({
            where:{id:projectId},
            include: {members:{include:{user: true}}}
         })

         if(!project){
            return res.status(404).json({message: "Project not found"});
         }
         if(project.team_lead !== userId){
            return res.status(403).json({message: "Only the project lead can add members"})
         }

         //check user is already member
         const exitingMember = project.members.find((member)=>member.user.email === email)
         if(exitingMember){
            return res.status(400).json({message: "User is already member"})
         }

         const workspaceMember = await prisma.workspaceMember.findFirst({
            where: {
                workspaceId: project.workspaceId,
                user: { email }
            }
         });
         if(!workspaceMember){
            return res.status(404).json({message: "User is not a member of this workspace"})
         }

         await prisma.projectMember.upsert({
            where: {
                userId_projectId: {
                    userId: workspaceMember.userId,
                    projectId
                }
            },
            update: {},
            create: {
                userId: workspaceMember.userId,
                projectId
            }
         })
         res.json({message : "member added successfully"})

    }catch(e){
       console.log(e);
       res.status(500).json({message: e.code || e.message})
    }
}