import { Inngest } from "inngest";
import sendEmail from "../configs/nodemailer.js";
import prisma from "../configs/prisma.js";

export const inngest = new Inngest({ id: "project-management" });

const getUserEmail = (data) => {
    const primaryEmail = data?.email_addresses?.find(
        (email) => email.id === data.primary_email_address_id
    )?.email_address;
    return primaryEmail || data?.email_addresses?.[0]?.email_address || data?.email || "";
};

const getWorkspaceRole = (data) => {
    const role = String(data.role_name || data.role || "").toLowerCase();
    return role.includes("admin") ? "ADMIN" : "MEMBER";
};

const syncUserCreation = inngest.createFunction(
    { 
        id: 'sync-user-from-clerk',
        triggers: [{ event: "clerk/user.created" }] 
    },
    async ({ event }) => {
        const { data } = event;
        const email = getUserEmail(data);
        if (!email) throw new Error(`Clerk user ${data.id} has no email address`);
        const name = `${data?.first_name || ''} ${data?.last_name || ''}`.trim() || data?.username || "User";

        await prisma.user.upsert({
            where: { id: data.id },
            update: {
                email,
                name,
                image: data?.image_url || "",
            },
            create: {
                id: data.id,
                email,
                name,
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
        const email = getUserEmail(data);
        if (!email) throw new Error(`Clerk user ${data.id} has no email address`);
        const name = `${data?.first_name || ''} ${data?.last_name || ''}`.trim() || data?.username || "User";

        await prisma.user.upsert({
            where: { id: data.id },
            update: {
                email,
                name,
                image: data?.image_url || "",
            },
            create: {
                id: data.id,
                email,
                name,
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
        if (!ownerId) throw new Error(`Clerk organization ${data.id} has no creator`);

        const owner = await prisma.user.findUnique({ where: { id: ownerId } });
        if (!owner) throw new Error(`Owner ${ownerId} is not synced yet`);

        await prisma.workspace.upsert({
            where: { id: data.id },
            update: {
                name: data.name,
                slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
                image_url: data.image_url || "",
            },
            create: {
                id: data.id,
                name: data.name,
                slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
                ownerId,
                image_url: data.image_url || "",
            }
        });

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
// Inngest function to update workspace data to database safely
const syncWorkspaceUpdation = inngest.createFunction(
    { 
        id: 'update-workspace-from-clerk',
        triggers: [{ event: "clerk/organization.updated" }] 
    },
    async({event})=> {
        const {data} = event;
        
        // Check if the workspace already exists in the database
        const existingWorkspace = await prisma.workspace.findUnique({
            where: { id: data.id }
        });

        if (!existingWorkspace) {
            throw new Error(`Workspace ${data.id} is not synced yet`);
        }

        // If it exists, perform the update normally
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
// workspace deletion
const syncWorkspaceDeletion = inngest.createFunction(
    {
        id: 'delete-workspace-with-clerk',
        triggers: [{ event: "clerk/organization.deleted" }]
    },
    async ({ event }) => {
        const { data } = event;
        await prisma.workspace.deleteMany({ where: { id: data.id } });
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
                role: getWorkspaceRole(data),
            },
            create: {
                userId: userId,
                workspaceId: orgId,
                role: getWorkspaceRole(data),
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

        await prisma.workspaceMember.upsert({
            where: {
                userId_workspaceId: {
                    userId: userId,
                    workspaceId: orgId,
                }
            },
            create: {
                userId,
                workspaceId: orgId,
                role: getWorkspaceRole(data),
            },
            update: {
                role: getWorkspaceRole(data),
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

        await prisma.workspaceMember.deleteMany({
            where: { userId, workspaceId: orgId }
        });
    }
);

const buildTaskEmail = (task, origin) => {
    const taskUrl = origin
        ? new URL(
            `/taskDetails?projectId=${encodeURIComponent(task.projectId)}&taskId=${encodeURIComponent(task.id)}&workspaceId=${encodeURIComponent(task.project.workspaceId)}`,
            origin
        ).toString()
        : "";

    return `<div style="max-width: 600px;">
  <h2>Hi ${task.assignee.name}</h2>
  <p style="font-size: 16px;">You've been assigned a task in ${task.project.name}.</p>
  <p style="font-size: 18px; font-weight: bold; color: #007bff; margin: 8px 0;">${task.title}</p>
  <div style="border: 1px solid #ddd; padding: 12px 16px; border-radius: 6px; margin-bottom: 30px;">
    <p style="margin: 6px 0;"><strong>Description:</strong> ${task.description || "No description"}</p>
    <p style="margin: 6px 0;"><strong>Due Date:</strong> ${task.due_date.toLocaleDateString()}</p>
  </div>
  ${taskUrl ? `<a href="${taskUrl}" style="background-color: #007bff; padding: 12px 24px; border-radius: 5px; color: #fff; font-weight: 600; font-size: 16px; text-decoration: none;">View Task</a>` : ""}
</div>`;
};

const sendTaskAssignmentEmail = inngest.createFunction(
    {
        id: "send-task-assignment-mail",
        triggers: [{ event: "app/task.assigned" }]
    },
    async ({ event, step }) => {
        const { taskId, origin } = event.data;
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { assignee: true, project: true }
        });
        if (!task) return;

        await step.run("send-assignment-email", () => sendEmail({
            to: task.assignee.email,
            subject: `New Task Assignment in ${task.project.name}`,
            body: buildTaskEmail(task, origin)
        }));

        if (task.due_date.getTime() <= Date.now()) return;
        await step.sleepUntil("wait-for-the-due-date", task.due_date);

        const taskAtDueDate = await step.run("check-if-task-is-completed", () =>
            prisma.task.findUnique({
                where: { id: taskId },
                include: { assignee: true, project: true }
            })
        );
        if (!taskAtDueDate || taskAtDueDate.status === "DONE") return;

        await step.run("send-task-reminder-email", () => sendEmail({
            to: taskAtDueDate.assignee.email,
            subject: `Reminder for ${taskAtDueDate.project.name}`,
            body: buildTaskEmail(taskAtDueDate, origin)
        }));
    }
);

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