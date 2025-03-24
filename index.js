import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
const app = express();
const port = process.env.PORT || 8000;
app.use(cookieParser());
import connectToDB from './config/db.js';
connectToDB();

const corsOptions = {
  origin: 'https://expense-i.netlify.app/',
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (_req, res) => {
    res.send('Hello World!');
})

app.use('/api/auth/', authRoutes);
app.use('/api/expense/', expenseRoutes);
 
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});