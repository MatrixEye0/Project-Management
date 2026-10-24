import prisma from "../configs/prisma.js";
import sendEmail from "../configs/nodemailer.js";

// get all workspaces the logged-in user is a member of
export const getUserWorkspaces = async (req, res) => {
    try {
        const { userId } = await req.auth();

        const workspaces = await prisma.workspace.findMany({
            where: {
                members: { some: { userId } },
            },
            include: {
                members: { include: { user: true } },
                projects: {
                    include: {
                        tasks: {
                            include: {
                                assignee: true,
                                comments: { include: { user: true } },
                            },
                        },
                        members: { include: { user: true } },
                    },
                },
                owner: true,
            },
        });

        res.json({ workspaces });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
};

// add member to workspace
export const addMember = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { email, role, workspaceId, message } = req.body;

        if (!email || !workspaceId || !role) {
            return res.status(400).json({ message: "Missing required parameter" });
        }

        if (!["ADMIN", "MEMBER"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // check the invited user exists
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // fetch workspace (relation name in schema is `members`)
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: { members: true },
        });
        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // only an admin of this workspace can add people
        const isAdmin = workspace.members.some(
            (m) => m.userId === userId && m.role === "ADMIN"
        );
        if (!isAdmin) {
            return res.status(403).json({ message: "You do not have admin authority" });
        }

        // check the INVITED user (user.id) is not already a member
        const existingMember = workspace.members.find((m) => m.userId === user.id);
        if (existingMember) {
            return res.status(400).json({ message: "User is already a member" });
        }

        const member = await prisma.workspaceMember.create({
            data: {
                userId: user.id,
                workspaceId,
                role,
                message: message || "",
            },
        });

        res.json({ member, message: "Member added successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
};