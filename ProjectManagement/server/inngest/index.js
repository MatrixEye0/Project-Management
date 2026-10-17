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
// inngest function to save workspace data to database
const syncWorkspaceCreation = inngest.createFunction(
    { 
        id: 'sync-workspace-from-clerk',
        triggers: [{ event: "clerk/workspace.created" }] 
    },
    async({event})=> {
        const {data} = event; 
        await prisma.workspace.create({
            data: {
                id: data.id,
                name: data.name,
                slug: data.slug,
                ownerId: data.created_by,
                image: data.image_url || "",
            }
        })
        // add creator to workspace members
        await prisma.workspaceMember.create({
            data: {
                userId: data.created_by,
                workspaceId: data.id,
                role: "ADMIN",
            }
        })
    }
)
// inngest function to update workspace data to database
const syncWorkspaceUpdation = inngest.createFunction(
    { 
        id: 'update-workspace-from-clerk',
        triggers: [{ event: "clerk/workspace.updated" }] 
    },
    async({event})=> {
        const {data} = event;
        await prisma.workspace.update({
            where: {
                id: data.id,
            },
            data: {
                name: data.name,
                slug: data.slug,
                image: data.image_url || "",
            }
        })
    }
)
// inngest function to delete workspace data from database
const syncWorkspaceDeletion = inngest.createFunction(
    {
        id: 'delete-workspace-with-clerk',
        triggers: [{ event: "clerk/workspace.deleted" }]
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
)

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];