import Notice from "../models/noticeModel.js";
import Task from "../models/taskModel.js";
import User from "../models/userModel.js";
import { duplicateTaskMail, sendActivityNotification, sendNewTask } from "../service/emailService.js";

export const createTask = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { title, team, description, stage, date, priority, assets } = req.body;
    
    let text = "You have task(s) which is assigned for you";

    const activity = {
      type: "assigned",
      activity: text,
      by: userId,
    };

    const task = await Task.create({
      title,
      team,
      description,
      stage: stage.toLowerCase(),
      date,
      priority: priority.toLowerCase(),
      assets,
      activities: activity,
    });

    const assignedUsers = await User.find({ _id: { $in: task.team } });

    for (const user of assignedUsers) {
      const userEmail = user.email;
      const userName = user.name;
      await sendNewTask(userEmail, userName, task);
    }

    if (task.team.length > 1) {
      text = text + ` and another ${task.team.length - 1} task(s) have been assigned!`;
    } else {
      text = text + `!`;
    }

    text = text + `The priority level of task is set to ${task.priority} level. The task date is ${task.date.toDateString()}. Thanks!!!`;

    await Notice.create({
      team, text, task: task._id
    });

    res.status(200).json({ status: true, message: "Task created successfully!" });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
  }
}


export const duplicateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    const newTask = await Task.create({
      title: task.title + " - Duplicate",
      description: task.description,
      team: task.team,
      subTasks: task.subTasks,
      assets: task.assets,
      priority: task.priority,
      stage: task.stage,
      date: task.date,
      activities: task.activities,
    });

    await newTask.save();

    const assignedUsers = await User.find({ _id: { $in: newTask.team } });

    for (const user of assignedUsers) {
      const userEmail = user.email;
      const userName = user.name;
      await duplicateTaskMail(userEmail, userName, newTask);
    }

    let text = "You have task(s) which is assigned for you";

    if (task.team.length > 1) {
      text = text + ` and another ${task.team.length - 1} task(s) have been assigned!`;
    } else {
      text = text + `!`;
    }

    text = text + `The priority level of task is set to ${task.priority} level. The task date is ${task.date.toDateString()}. Thanks!!!`;

    await Notice.create({
      team: task.team, text, task: task._id
    });

    res.status(200).json({ status: true, message: "Task duplicated successfully!" });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
  }
}

export const postTaskActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const { type, activity } = req.body;

    const task = await Task.findById(id).populate('team');

    const data = {
      type, 
      activity: activity.replace(/\r?\n/g, '\n'), 
      by: userId,
    };

    task.activities.push(data);

    await task.save();

    let text = `A new ${data.type} activity has been added to the task "${task.title}".`;

    if (data.type === 'commented') {
      text = `${task.team.find((user) => user._id == userId).name} commented on the task "${task.title}".`;
    };

    await Notice.create({
      team: task.team.map(user => user._id),
      text: text,
      task: task._id
    });

    for (const user of task.team) {
      const userEmail = user.email;
      const userName = user.name;
      await sendActivityNotification(userEmail, userName, task, data);
    }

    res.status(200).json({ status: true, message: "Activity posted successfully!" });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
  }
}

export const dashboardStatistics = async (req, res, next) => {
  try {
    const { userId, isAdmin } = req.user;

    const allTasks = isAdmin
      ? await Task.find({ isTrashed: false })
        .populate({
          path: "team",
          model: "User",
          select: "name title email"
        })
        .sort({ _id: -1 })
      : await Task.find({ isTrashed: false, team: { $all: [userId] } })
        .populate({
          path: "team",
          model: "User",
          select: "name title email"
        })
        .sort({ _id: -1 });

    const users = await User.find({ isActive: true })
      .select("name title role isAdmin createdAt isActive")
      .limit(10)
      .sort({ _id: -1 });

    const groupTaskks = allTasks.reduce((result, task) => {
      const stage = task.stage;

      if (!result[stage]) {
        result[stage] = 1;
      } else {
        result[stage] += 1;
      }

      return result;
    }, {});

    const groupData = Object.entries(
      allTasks.reduce((result, task) => {
        const { priority } = task;

        result[priority] = (result[priority] || 0) + 1;
        return result;
      }, {})
    ).map(([name, total]) => ({ name, total }));

    const totalTasks = allTasks?.length;
    const last10Task = allTasks?.slice(0, 10);

    const summary = {
      totalTasks,
      last10Task,
      users: isAdmin ? users : [],
      tasks: groupTaskks,
      graphData: groupData,
    };

    res.status(200).json({
      status: true,
      message: "Successfully",
      ...summary,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
  }
}

export const getTasks = async (req, res, next) => {
  try {
    const { stage, isTrashed, search } = req.query;

    let query = { isTrashed: isTrashed ? true : false };

    if (stage) {
      query.stage = stage;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    let queryResult = Task.find(query).populate({
      path: "team", select: "name title email",
    }).sort({ _id: -1 });

    const tasks = await queryResult;

    res.status(200).json({
      status: true,
      tasks
    })
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
  }
}

export const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id).populate({
      path: "team", select: "name title role email"
    }).populate({
      path: "activities.by",
      select: "name",
    }).sort({ _id: -1 })

    res.status(200).json({
      status: true,
      task
    })
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
  }
}

export const createSubTask = async (req, res, next) => {
  try {
    const { title, tag, date } = req.body;
    const { id } = req.params;

    const newSubTask = {
      title, date, tag
    }

    const task = await Task.findById(id);

    task.subTasks.push(newSubTask);

    await task.save();

    res.status(200).json({ status: true, message: "Add sub-task successfully!" });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
  }
}

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, team, description, stage, date, priority, assets } = req.body;

    const task = await Task.findById(id);

    task.title = title;
    task.team = team;
    task.description = description;
    task.stage = stage.toLowerCase();
    task.date = date;
    task.priority = priority.toLowerCase();
    task.assets = assets;

    await task.save();

    res.status(200).json({ status: true, message: "Updated task successfully!" });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
  }
}

export const trashTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    task.isTrashed = true;

    await task.save();

    res.status(200).json({ status: true, message: "Deleted task successfully!" });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
  }
}

export const deleteRestoreTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { actionType } = req.query;

    if (actionType === "delete") {
      await Task.findByIdAndDelete(id);
    } else if (actionType === "deleteAll") {
      await Task.deleteMany({ isTrashed: true });
    } else if (actionType === "restore") {
      const resp = await Task.findById(id);

      resp.isTrashed = false;
      resp.save();
    } else if (actionType === "restoreAll") {
      await Task.updateMany({ isTrashed: true }, { $set: { isTrashed: false } });
    }

    res.status(200).json({ status: true, message: "Operation successfully!" });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      res.status(400).json({ status: false, message: "Operation error!" });
    } else {
      res.status(500).json({ status: false, message: "Database connection error. Please try again later!" });
    }
  }
}