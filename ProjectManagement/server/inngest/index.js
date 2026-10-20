import { Inngest } from "inngest";
import { PrismaClient } from "@prisma/client";

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

export const functions = [
    syncUserCreation, 
    syncUserDeletion,
    syncUserUpdation,
    syncWorkspaceCreation,
    syncWorkspaceUpdation,
    syncWorkspaceDeletion,
    syncWorkspaceMemberCreation,
    syncWorkspaceMemberUpdation,
    syncWorkspaceMemberDeletion
];