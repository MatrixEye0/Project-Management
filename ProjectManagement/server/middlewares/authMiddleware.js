import prisma from "../configs/prisma.js";
import { syncClerkUser } from "../utils/syncClerkUser.js";

export const protect = async (req, res, next) => {
    try{
      const {userId}= await req.auth()

      if(!userId){
        return res.status(401).json({message: "Unauthorized"})
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (!user) {
        await syncClerkUser(userId);
      }

      return next()
    }
    catch(error){
       console.error("Failed to sync authenticated Clerk user:", error);
       if (error.code === "P2002") {
         return res.status(409).json({ message: "This Clerk account email is already associated with another user." });
       }
       if (error.message?.includes("does not have a primary email address")) {
         return res.status(422).json({ message: error.message });
       }
       res.status(500).json({message: "Unable to prepare your account. Please try again."});
    }
}