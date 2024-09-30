import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { isValidEmail } from "../utils/ValidEmail.js";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

export const registerUser = async (req, res) => {
  const { email, password, name, role = 'Manager' } = req.body;

  try {
    if (!['Manager', 'TeamMember'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, name, password: hashedPassword, role });

    await newUser.save();
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: "Service unavailable", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

  } catch (error) {
    res.status(500).json({ message: 'Service unavailable', error: error.message });
  }
};

export const getUserInfo = (req, res) => {
  if (req.user) {
    User.findById(req.user.id)
      .select('-password')
      .then(user => res.json(user))
      .catch(err => res.status(500).json({ message: 'Server error', error: err.message }));
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export const logoutUser = async (req, res) => {
  try {
    req.session = null;
    res.json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: "Service unavailable", error: error.message });
  }
};

export const inviteMember = async (req, res) => {
  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid emaill address' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const token = jwt.sign(
    { email, role: "TeamMember" },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  const invitationLink = `${process.env.FRONTEND_URL}/set-up-account?token=${token}`;

  try {
    await sendInvitationEmail(email, invitationLink);
    return res.status(200).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ message: 'Error sending invitation email' });
  }
};