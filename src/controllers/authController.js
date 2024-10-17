import User from "../models/userModel.js";
import bcrypt from 'bcryptjs';
import { validationResult, body } from 'express-validator';
import { createJWT } from "../utils/createJWT.js";
import { sendWelcomeEmail } from '../service/emailService.js';
import { generateRandomPassword } from "../utils/generatePassword.js";

export const registerUser = async (req, res, next) => {
  const validationErrors = [
    body("name", "Invalid Name").exists().notEmpty(),
    body("email", "Invalid email")
      .exists()
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password", "Invalid password")
      .exists()
      .notEmpty()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ];

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array()
    });
  }

  try {
    const { name, email, isAdmin, role, title } = req.body;

    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({
        status: false,
        message: "User already exists",
      });
    }

    const generatedPassword = generateRandomPassword();

    const user = await User.create({
      name,
      email,
      password: generatedPassword,
      isAdmin,
      role,
      title,
    });

    if (user) {
      if (isAdmin) {
        createJWT(res, user._id);
      }

      user.password = undefined;

      try {
        await sendWelcomeEmail(user.email, user.name, generatedPassword);
      } catch (emailError) {
        console.error('Error sending email:', emailError.message);
      }

      res.status(201).json(user);
    } else {
      return res.status(400).json({
        status: false,
        message: "Invalid user data",
      });
    }
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
};


export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ status: false, message: "Invalid email or password" });
    }

    if (!user?.isActive) {
      return res.status(401).json({ status: false, message: "Your account is disabled. Please contact to administrator!" });
    }

    const isMatch = await user.matchPassword(password);

    if (user && isMatch) {
      createJWT(res, user._id);

      user.password = undefined;

      res.status(200).json(user);
    } else {
      return res.status(401).json({ status: false, message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(400).json({ status: false, message: error.message })
  }
}

export const logoutUser = async (req, res, next) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0)
    });

    res.status(200).json({ message: "Logout successful!" })
  } catch (error) {
    res.status(400).json({ status: false, message: error.message })
  }
}

export const changeUserPassword = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { currentPassword, password } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ status: false, message: "Current password is incorrect" });
    }

    user.password = password;
    await user.save();

    res.status(200).json({
      status: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
}