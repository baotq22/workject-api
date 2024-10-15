import User from "../models/userModel.js";
import Notice from "../models/noticeModel.js";
import { createJWT } from "../utils/createJWT.js";
import { sendWelcomeEmail } from '../service/emailService.js';
import { generateRandomPassword } from "../utils/generatePassword.js";

export const registerUser = async (req, res, next) => {
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

export const getTeamList = async (req, res, next) => {
  try {
    const { searchTerm } = req.query;

    const query = searchTerm
      ? { name: { $regex: searchTerm, $options: "i" } }
      : {};

    const users = await User.find().select("name title role email isActive");
    res.status(200).json(users)
  } catch (error) {
    res.status(400).json({ status: false, message: error.message })
  }
}

export const getNotificationsList = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const notice = await Notice.find({
      team: userId
    }).populate("task", "title").sort({ createdAt: -1 });

    const unreadCount = await Notice.countDocuments({
      team: userId,
      isRead: { $nin: [userId] }
    });

    res.status(201).json({ notice, unreadCount });
  } catch (error) {
    res.status(400).json({ status: false, message: error.message });
  }
}

export const updateUserProfile = async (req, res, next) => {
  try {
    const { userId, isAdmin } = req.user;
    const { _id } = req.body;

    const id = isAdmin && userId === _id ? userId : isAdmin && userId !== _id ? _id : userId;

    const user = await User.findById(id);

    if (user) {
      user.name = req.body.name || user.name;
      user.title = req.body.title || user.title;
      user.role = req.body.role || user.role;

      const updateUser = await user.save();

      user.password = undefined;

      res.status(201).json({
        status: true,
        message: "Updated Profile Successfully",
        user: updateUser,
      })
    } else {
      res.status(404).json({ status: false, message: "User not found" })
    }
  } catch (error) {
    res.status(400).json({ status: false, message: error.message })
  }
}

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { isReadType, id } = req.query;

    if (isReadType === "all") {
      await Notice.updateMany(
        { team: userId, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    } else {
      await Notice.findOneAndUpdate(
        { _id: id, isRead: { $nin: [userId] } },
        { $push: { isRead: userId } },
        { new: true }
      );
    }

    res.status(201).json({
      status: true,
      message: "Mark Done"
    })
  } catch (error) {
    res.status(400).json({ status: false, message: error.message })
  }
}

export const changeUserPassword = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId);

    if (user) {
      user.password = req.body.password;

      await user.save();

      user.password = undefined;

      res.status(201).json({
        status: true,
        message: "Chnage password successfully"
      })
    } else {
      res.status(404).json({ status: false, message: "User not found" })
    }
  } catch (error) {
    res.status(400).json({ status: false, message: error.message })
  }
}

export const activateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (user) {
      user.isActive = req.body.isActive;

      await user.save();

      res.status(201).json({
        status: true,
        message: `This account has been ${user?.isActive ? "activated" : "disactivated"}`
      })
    } else {
      res.status(404).json({ status: false, message: "User not found" })
    }
  } catch (error) {
    res.status(400).json({ status: false, message: error.message })
  }
}

export const deleteUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      message: `Deleted Successfully`
    })
  } catch (error) {
    res.status(400).json({ status: false, message: error.message })
  }
}
