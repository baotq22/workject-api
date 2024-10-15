import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { dbConnection } from './src/utils/dbConnection.js';
import { errorHandler, RouteNotFound } from './src/middlewares/errorMiddlewares.js';
import { router } from './src/routes/index.js';

dotenv.config();

dbConnection()

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}))

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(cookieParser());
app.use(morgan("dev"));

app.use("/", router);

app.use(RouteNotFound);
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));