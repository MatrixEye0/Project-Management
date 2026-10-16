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

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];