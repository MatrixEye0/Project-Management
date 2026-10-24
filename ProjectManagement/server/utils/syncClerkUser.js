import { clerkClient } from "@clerk/express";
import prisma from "../configs/prisma.js";

export const syncClerkUser = async (userId) => {
    const clerkUser = await clerkClient.users.getUser(userId);
    const email = clerkUser.primaryEmailAddress?.emailAddress;

    if (!email) {
        throw new Error(`Clerk user ${userId} does not have a primary email address`);
    }

    const name = [clerkUser.firstName, clerkUser.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() || clerkUser.username || "User";

    return prisma.user.upsert({
        where: { id: clerkUser.id },
        update: {
            email,
            name,
            image: clerkUser.imageUrl || "",
        },
        create: {
            id: clerkUser.id,
            email,
            name,
            image: clerkUser.imageUrl || "",
        },
    });
};
