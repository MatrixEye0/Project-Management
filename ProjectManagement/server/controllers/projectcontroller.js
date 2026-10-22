// create project
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
         const teamLead = await prisma.user.findUnique({
            where:{email: team_lead},
            select: {id:true}
         })
         const project = await prisma.project.create({
            data:{
                workspaceId,
                name,
                description,
                status,
                priority,
                progress,
                team_lead: teamLead?.id,
                start_date: start_date ? new Date(start_date) : null,
                end_date: end_date ? new Date(end_date) : null
            }
         })

         // add member to project if they are in organization
         if(team_members?.length > 0){
            const membersToAdd = []
            workspace.members.forEach(member => {
                if(team_members.includes(member.user.email)){
                    membersToAdd.push(member.user.id)
                }
            })
            await prisma.projectMember.createMany({
                data: membersToAdd.map(memberId => ({
                    projectId: project.id,
                    userId: memberId
                }))
            })
         }

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

         //check user is project lead 
         const project = await prisma.project.findUnique({
            where:{id:projectId},
            include: {members:{include:{user: true}}}
         })

         if(!project){
            res.status(404).json({message: "Project not found"});
         }
         if(project.team_lead !== userId){
            return res.status(404).json({message: "Only project lead add member"})
         }

         //check user is already member
         const exitingMember = project.members.find((member)=>member.email === email)
         if(exitingMember){
            return res.status(400).json({message: "User is already member"})
         }

         const user = await prisma.user.findUnique({where:{email}});
         if(!user){
            return res.status(404).json({message: "User not found"})
         }

         const member = await prisma.projectMember.create({
            data:{
                userId: user.id,
                projectId
            }
         })
         res.json({message : "member added successfully"})

    }catch(e){
       console.log(e);
       res.status(500).json({message: e.code || e.message})
    }
}