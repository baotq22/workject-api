import nodemailer from "nodemailer";

export const sendInvitationEmail = async (recipientEmail, invitationLink) => {
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
    subject: 'Invitation to Join Our Team',
    text: `You have been invited to join our team. Please set up your account by clicking the following link: ${invitationLink}`,
  };

  return transporter.sendMail(mailOptions);
}