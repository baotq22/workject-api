import User from "../models/userModel.js";
import Notice from "../models/noticeModel.js";

export const getTeamList = async (req, res, next) => {
  try {
    const { searchTerm } = req.query;

    const query = searchTerm
      ? { name: { $regex: searchTerm, $options: "i" } }
      : {};

    const users = await User.find().select("name title role email isActive");
    res.status(200).json(users)
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
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
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
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
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
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
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
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
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
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
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
  }
}
