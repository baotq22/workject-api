import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import authRole from "./routes/auth.js"
import bookingRole from "./routes/booking.js"
import ticketsRole from "./routes/tickets.js"
import cors from "cors"
import bodyParser from "body-parser"
import autoCancel from "./cron/autoCancel.js"

const app = express();
dotenv.config()

app.use(cors({
  origin: 'http://localhost:5173'
}));

const connection = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("success");
  } catch (error) {
    throw error
  }
};

app.use(bodyParser.json());

autoCancel();

//middlewares
app.use("/api/auth", authRole);
app.use("/api/tickets", ticketsRole);
app.use("/api/booking", bookingRole);

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected...'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the server if there's an issue
  });


const PORT = process.env.PORT || 8800;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));