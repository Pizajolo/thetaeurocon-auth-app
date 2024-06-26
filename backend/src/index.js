import express from 'express';
import bodyParser from "body-parser";
import userRoutes from './routes/user.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
    origin: 'https://register.theta-euro.com' // http://localhost:300
}));

app.use('/api', userRoutes); // Use the routes, prefixed with /api

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});