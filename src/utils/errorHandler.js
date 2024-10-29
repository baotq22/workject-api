// utils/errorHandler.js
export const handleError = (res, error) => {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ status: false, message: "Operation error!" });
  }
  
  return res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
};
