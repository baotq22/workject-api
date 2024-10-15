import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendWelcomeEmail = async (recipientEmail, userName, password) => {
  const templatePath = path.resolve(__dirname, '../assets/welcomeEmailTemplate.html');
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  htmlContent = htmlContent
    .replace('{{userName}}', userName)
    .replace('{{recipientEmail}}', recipientEmail)
    .replace('{{password}}', password);

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'Invitation to Join WorkJect',
    html: htmlContent
  };

  return transporter.sendMail(mailOptions);
};

export const sendNewTask = async (recipientEmail, userName, task) => {
  const templatePath = path.resolve(__dirname, '../assets/newTaskTemplate.html');
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  htmlContent = htmlContent
    .replace('{{userName}}', userName)
    .replace('{{taskTitle}}', task.title)
    .replace('{{taskDescription}}', task.description)
    .replace('{{taskPriority}}', task.priority)
    .replace('{{taskDate}}', task.date.toDateString());

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'New Task Assigned to You',
    html: htmlContent
  };

  return transporter.sendMail(mailOptions);
};

export const sendActivityNotification = async (recipientEmail, userName, task, activity) => {
  const templatePath = path.resolve(__dirname, '../assets/activityNotificationTemplate.html');
  let htmlContent = fs.readFileSync(templatePath, 'utf8');
  
  htmlContent = htmlContent
  .replace('{{userName}}', userName)
  .replace('{{taskTitle}}', task.title)
  .replace('{{taskType}}', activity.type)
  .replace('{{taskActivity}}', activity.activity)
  .replace('{{taskDate}}', task.date.toDateString());
  
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    }
  });
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `New Activity Added to Task: ${task.title}`,
    html: htmlContent
  };
  
  return transporter.sendMail(mailOptions);
};

export const duplicateTaskMail = async (recipientEmail, userName, task) => {
  const templatePath = path.resolve(__dirname, '../assets/newTaskTemplate.html');
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  htmlContent = htmlContent
    .replace('{{userName}}', userName)
    .replace('{{taskTitle}}', task.title)
    .replace('{{taskDescription}}', task.description)
    .replace('{{taskPriority}}', task.priority)
    .replace('{{taskDate}}', task.date.toDateString());

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'New Task Assigned to You',
    html: htmlContent
  };

  return transporter.sendMail(mailOptions);
}