export const getUserWorkspaces = async (req, res)=>{
    try{
      const {userId} = await req.auth();
      const workspaces = await Prisma.worksapce.findMany({
        where:{
            members:{ some:{userId: userId}}
        },
        include:{
            members: {include:{user:true}},
            projects:{
                include:{
                    tasks:{include:{assignee:true, comments:{
                        include:{user:true}}}},
                        members:{include:{user:true}}
                }
            },
            owner:true
        }
      });
      res.json({workspaces})
    }catch(error){
       console.log(error)
       res.status(500).json({message:error.code || error.message})
    }
}