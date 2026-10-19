import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

export const inngest = new Inngest({ id: "project-management" });

/* ---------------- USER ---------------- */

const syncUserCreation = inngest.createFunction(
    { id: "sync-user-from-clerk", triggers: { event: "clerk/user.created" } },
    async ({ event }) => {
        const { data } = event;
        const email = data?.email_addresses?.[0]?.email_address;

        await prisma.user.upsert({
            where: { id: data.id },
            update: {},
            create: {
                id: data.id,
                email,
                name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || email,
                image: data.image_url || "",
            },
        });
    }
);

const syncUserUpdation = inngest.createFunction(
    { id: "update-user-from-clerk", triggers: { event: "clerk/user.updated" } },
    async ({ event }) => {
        const { data } = event;
        const email = data?.email_addresses?.[0]?.email_address;

        await prisma.user.update({
            where: { id: data.id },
            data: {
                email,
                name: `${data.first_name || ""} ${data.last_name || ""}`.trim() || email,
                image: data.image_url || "",
            },
        });
    }
);

const syncUserDeletion = inngest.createFunction(
    { id: "delete-user-with-clerk", triggers: { event: "clerk/user.deleted" } },
    async ({ event }) => {
        await prisma.user.deleteMany({ where: { id: event.data.id } });
    }
);

/* ---------------- ORGANIZATION -> WORKSPACE ---------------- */

const syncWorkspaceCreation = inngest.createFunction(
    { id: "sync-workspace-from-clerk", triggers: { event: "clerk/organization.created" } },
    async ({ event }) => {
        const { data } = event;

        // If the user row isn't there yet this throws (FK error) and Inngest retries automatically
        await prisma.workspace.upsert({
            where: { id: data.id },
            update: {},
            create: {
                id: data.id, // Workspace.id has no default, so use the Clerk org id
                name: data.name,
                slug: data.slug,
                ownerId: data.created_by,
                image_url: data.image_url || "",
            },
        });

        // creator becomes ADMIN (upsert so the membership event can't conflict)
        await prisma.workspaceMember.upsert({
            where: {
                userId_workspaceId: { userId: data.created_by, workspaceId: data.id },
            },
            update: { role: "ADMIN" },
            create: {
                userId: data.created_by,
                workspaceId: data.id,
                role: "ADMIN",
            },
        });
    }
);

const syncWorkspaceUpdation = inngest.createFunction(
    { id: "update-workspace-from-clerk", triggers: { event: "clerk/organization.updated" } },
    async ({ event }) => {
        const { data } = event;

        await prisma.workspace.update({
            where: { id: data.id },
            data: {
                name: data.name,
                slug: data.slug,
                image_url: data.image_url || "",
            },
        });
    }
);

const syncWorkspaceDeletion = inngest.createFunction(
    { id: "delete-workspace-with-clerk", triggers: { event: "clerk/organization.deleted" } },
    async ({ event }) => {
        await prisma.workspace.deleteMany({ where: { id: event.data.id } });
    }
);

/* ---------------- MEMBERSHIP ---------------- */

const syncWorkspaceMemberCreation = inngest.createFunction(
    { id: "sync-workspace-member-from-clerk", triggers: { event: "clerk/organizationInvitation.accepted" } },
    async ({ event }) => {
        const { data } = event;
        const email = data.email_address;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("User not synced yet, retrying");

        await prisma.workspaceMember.upsert({
            where: {
                userId_workspaceId: { userId: user.id, workspaceId: data.organization_id },
            },
            update: {},
            create: {
                userId: user.id,
                workspaceId: data.organization_id,
                role: String(data.role_name || data.role).toLowerCase().includes("admin")
                    ? "ADMIN"
                    : "MEMBER",
            },
        });
    }
);

export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    syncWorkspaceCreation,
    syncWorkspaceUpdation,
    syncWorkspaceDeletion,
    syncWorkspaceMemberCreation,
];