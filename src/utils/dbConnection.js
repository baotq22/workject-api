import mongoose from 'mongoose';

export const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Success");
  } catch (error) {
    console.log("DB Connection Error: " + error);
  }
}
