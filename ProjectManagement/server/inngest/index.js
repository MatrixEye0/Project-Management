import { Inngest } from "inngest";
import { PrismaClient } from "@prisma/client";
import sendEmail from "../configs/nodemailer.js";

const prisma = new PrismaClient();

export const inngest = new Inngest({ id: "project-management" });

const syncUserCreation = inngest.createFunction(
    { 
        id: 'sync-user-from-clerk',
        triggers: [{ event: "clerk/user.created" }] 
    },
    async ({ event }) => {
        const { data } = event;
        const email = data?.email_addresses?.[0]?.email_address || data?.email || "";
        const name = `${data?.first_name || ''} ${data?.last_name || ''}`.trim() || data?.username || "User";

        await prisma.user.create({
            data: {
                id: data.id,
                email: email,
                name: name,
                image: data?.image_url || "",
            }
        });
    }
);

const syncUserDeletion = inngest.createFunction(
    { 
        id: 'delete-user-with-clerk',
        triggers: [{ event: "clerk/user.deleted" }] 
    },
    async ({ event }) => {
        const { data } = event;
        try {
            await prisma.user.delete({
                where: {
                    id: data.id,
                }
            });
        } catch (error) {
            console.log(`User ${data.id} not found or already deleted.`);
        }
    }
);

const syncUserUpdation = inngest.createFunction(
    { 
        id: 'update-user-from-clerk',
        triggers: [{ event: "clerk/user.updated" }] 
    },
    async ({ event }) => {
        const { data } = event;
        const email = data?.email_addresses?.[0]?.email_address || data?.email || "";
        const name = `${data?.first_name || ''} ${data?.last_name || ''}`.trim() || data?.username || "User";

        await prisma.user.update({
            where: {
                id: data.id,
            },
            data: {
                email: email,
                name: name,
                image: data?.image_url || "",
            }
        });
    }
);

// Inngest function to save workspace data to database
const syncWorkspaceCreation = inngest.createFunction(
    { 
        id: 'sync-workspace-from-clerk',
        triggers: [{ event: "clerk/organization.created" }] 
    },
    async({event})=> {
        const {data} = event; 
        const ownerId = data.created_by;

        await prisma.workspace.create({
            data: {
                id: data.id,
                name: data.name,
                slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
                ownerId: ownerId,
                image_url: data.image_url || "",
            }
        });

        // Add creator to workspace members safely
        await prisma.workspaceMember.upsert({
            where: {
                userId_workspaceId: {
                    userId: ownerId,
                    workspaceId: data.id,
                }
            },
            update: { role: "ADMIN" },
            create: {
                userId: ownerId,
                workspaceId: data.id,
                role: "ADMIN",
            }
        });
    }
);

// Inngest function to update workspace data to database
const syncWorkspaceUpdation = inngest.createFunction(
    { 
        id: 'update-workspace-from-clerk',
        triggers: [{ event: "clerk/organization.updated" }] 
    },
    async({event})=> {
        const {data} = event;
        await prisma.workspace.update({
            where: {
                id: data.id,
            },
            data: {
                name: data.name,
                slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
                image_url: data.image_url || "",
            }
        });
    }
);

// Inngest function to delete workspace data from database
const syncWorkspaceDeletion = inngest.createFunction(
    {
        id: 'delete-workspace-with-clerk',
        triggers: [{ event: "clerk/organization.deleted" }]
    },
    async({event})=> {
        const {data} = event;
        try {
            await prisma.workspace.delete({
                where: {
                    id: data.id,
                }
            });
        } catch (error) {
            console.log(`Workspace ${data.id} not found or already deleted.`);
        }
    }
);

// Inngest function to add workspace member data to database
const syncWorkspaceMemberCreation = inngest.createFunction(
    {
        id: 'sync-workspace-member-from-clerk',
        triggers: [
            { event: "clerk/organization_membership.created" },
            { event: "clerk/organizationInvitation.accepted" }
        ]
    },
    async({event})=> {
        const {data} = event;
        const userId = data.user_id || data.public_user_data?.user_id;
        const orgId = data.organization_id || data.organization?.id;

        if (!userId || !orgId) return;

        await prisma.workspaceMember.upsert({
            where: {
                userId_workspaceId: {
                    userId: userId,
                    workspaceId: orgId,
                }
            },
            update: {
                role: String(data.role_name || data.role || "MEMBER").toUpperCase(),
            },
            create: {
                userId: userId,
                workspaceId: orgId,
                role: String(data.role_name || data.role || "MEMBER").toUpperCase(),
            }
        });
    }
);

// Inngest function to update workspace member data to database
const syncWorkspaceMemberUpdation = inngest.createFunction(
    {
        id: 'update-workspace-member-from-clerk',
        triggers: [{ event: "clerk/organization_membership.updated" }]
    },
    async({event})=> {
        const {data} = event;
        const userId = data.user_id || data.public_user_data?.user_id;
        const orgId = data.organization_id || data.organization?.id;

        if (!userId || !orgId) return;

        await prisma.workspaceMember.update({
            where: {
                userId_workspaceId: {
                    userId: userId,
                    workspaceId: orgId,
                }
            },
            data: {
                role: String(data.role_name || data.role || "MEMBER").toUpperCase(),
            }
        });
    }
);

// Inngest function to delete workspace member data from database
const syncWorkspaceMemberDeletion = inngest.createFunction(
    {
        id: 'delete-workspace-member-with-clerk',
        triggers: [{ event: "clerk/organization_membership.deleted" }]
    },
    async({event})=> {
        const {data} = event;
        const userId = data.user_id || data.public_user_data?.user_id;
        const orgId = data.organization_id || data.organization?.id;

        if (!userId || !orgId) return;

        try {
            await prisma.workspaceMember.delete({
                where: {
                    userId_workspaceId: {
                        userId: userId,
                        workspaceId: orgId,
                    }
                }
            });
        } catch (error) {
            console.log(`Workspace member ${userId} not found or already deleted.`);
        }
    }
);

// send email on task creation 
const sendTaskAssignmentEmail = inngest.createFunction(
    {id:"send-task-assignment-mail",
       triggers:[{ event :"app/task.assigned"}]
    },
    async ({event,step})=>{
        const {taskId, origin} = event.data;
        const task = await prisma.task.findUnique({
            where:{id: taskId},
            include:{assignee:true, project:true}
        })
        await sendEmail({
            to: task.assignee.email,
            subject:`New Task Assignment in ${task.project.name}`,
            body:`<div style="max-width: 600px;">
  <h2>Hi ${task.assignee.name}</h2>

  <p style="font-size: 16px;">You've been assigned a new task</p>
  <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${task.title}</p>

  <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 6px; margin-bottom: 30px;">
    <p style="margin: 6px 0;"><strong>Description:</strong> ${task.description}</p>
    <p style="margin: 6px 0;"><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>
  </div>

  <a href="${origin}" style="background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; font-weight: 600; font-size: 16px; text-decoration: none;">
    View Task
  </a>

  <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
    Please make sure to review and complete it before the due date.
  </p>
</div>`
        })

        if(new Date(task.due_date).toLocaleDateString() !== new Date().toDateString()){
          await step.sleepUntil('wait-for-the-due-date', new Date(task.due_date));

          await step.run('check-if-task-is-completed', async()=>{
            const task = await prisma.task.findUnique({
                where:{id:taskId},
                include: {assignee:true, project:true}
            })
            if(!task) return;
            if(task.status !== "DONE"){
                // FIXED: Corrected step.run argument syntax here
                await step.run('send-task-reminder-mail', async () => {
                    await sendEmail({
                        to: task.assignee.email,
                        subject: `Reminder for ${task.project.name}`,
                        body: `<div style="max-width: 600px;">
  <h2>Hi ${task.assignee.name}</h2>

  <p style="font-size: 16px;">You've been assigned a new task</p>
  <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${task.title}</p>

  <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 6px; margin-bottom: 30px;">
    <p style="margin: 6px 0;"><strong>Description:</strong> ${task.description}</p>
    <p style="margin: 6px 0;"><strong>Due Date:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>
  </div>

  <a href="${origin}" style="background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; font-weight: 600; font-size: 16px; text-decoration: none;">
    View Task
  </a>

  <p style="margin-top: 20px; font-size: 14px; color: #6c757d;">
    Please make sure to review and complete it before the due date.
  </p>
</div>`
                    })
                })
            }
          })
        }
    }
)

export const functions = [
    syncUserCreation, 
    syncUserDeletion,
    syncUserUpdation,
    syncWorkspaceCreation,
    syncWorkspaceUpdation,
    syncWorkspaceDeletion,
    syncWorkspaceMemberCreation,
    syncWorkspaceMemberUpdation,
    syncWorkspaceMemberDeletion,
    sendTaskAssignmentEmail
];