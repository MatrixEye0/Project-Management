import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { clerkMiddleware } from '@clerk/express'
import {serve} from 'inngest/express'
import { inngest, functions } from './inngest/index.js'

const app = express();

app.use(express.json());
app.use(cors());
app.use(clerkMiddleware());

app.get('/', (req, res) => {
    res.send('Hello from the server!');
});

app.use('/api/inngest', serve({client:inngest, functions }));

const PORT = process.env.PORT || 5000;

export default app;

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });