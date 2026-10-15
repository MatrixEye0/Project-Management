import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { clerkMiddleware } from '@clerk/express'
import {serve} from 'inngest/express'
import { inngest, functions } from './inngest/index.js'

const app = express();

app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('Hello from the server!');
});

app.use('/api/inngest', serve({client:inngest, functions }));

app.use(clerkMiddleware());
const PORT = process.env.PORT || 5000;

 app.listen(PORT, () => {
     console.log(`Server is running on port ${PORT}`);
 });

 export default app;