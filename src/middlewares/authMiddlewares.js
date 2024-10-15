import jsonwebtoken from "jsonwebtoken";
import User from "../models/userModel.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (token) {
      const decodedToken = jsonwebtoken.verify(token, process.env.JWT_SECRET);

      const response = await User.findById(decodedToken.userId).select("isAdmin email");

      req.user = {
        email: response.email,
        isAdmin: response.isAdmin,
        userId: decodedToken.userId
      };
      next();
    } else {
      return res.status(401).json({status: false, message: "Not authorized. Try login again"});
    }
  } catch (error) {
    return res.status(401).json({status: false, message: "Not authorized. Try login again"});
  }
};

export const isAdminRoute = async (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(401).json({
      status: false,
      message: "This route only for admin!"
    });
  }
};