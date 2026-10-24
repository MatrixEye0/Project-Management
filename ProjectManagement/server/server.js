import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { clerkMiddleware } from '@clerk/express'
import {serve} from 'inngest/express'
import { inngest, functions } from './inngest/index.js'
import workspaceRouter from './routes/workspaceRoutes.js'
import { protect } from './middlewares/authMiddleware.js'
import projectRouter from './routes/projectRoutes.js'
import taskRouter from './routes/taskRoutes.js'
import commentRouter from './routes/commentRoutes.js'

const app = express();

app.use(express.json());
app.use(cors({
    origin: ['https://project-management-la97.vercel.app', 'http://localhost:3000'], // Add your local dev URL if needed
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(clerkMiddleware());


app.get('/', (req, res) => {
    res.send('Hello from the server!');
});

app.use("/api/inngest", serve({client: inngest, functions }));

//routes
app.use("/api/workspaces", protect, workspaceRouter)
app.use("/api/projects", protect, projectRouter)
app.use('/api/tasks',protect, taskRouter)
app.use('/api/comments', protect, commentRouter)


const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
  });
}

 export default app;