import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    console.log('Received data:', { firstName, lastName, email, password });
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).send("Email is already taken.");
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error("Error in registration:", error);
    res.status(500).send("An error occurred while creating the user.");
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(400).send("Invalid credentials");
      return
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign(
      { _id: user._id, email },
      process.env.JWT_SECRET, { expiresIn: "2h" }
    );

    const refreshToken = jwt.sign(
      { _id: user._id, email },
      process.env.JWT_SECRET, { expiresIn: "7d" }
    );

    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.status(200).json({ user, token, refreshToken });
    return
  } catch (error) {
    console.error("Error in login:", error);
    if (!res.headersSent) {
      res.status(500).send("An error occurred while logging in the user");
    }
  }
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(403).send("Refresh token required");
    return 
  }

  try {
    const userData = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const accessToken = jwt.sign(
      { _id: (userData)._id, email: (userData).email },
      process.env.JWT_SECRET ,
      { expiresIn: "2h" }
    );
    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(401).send("Invalid refresh token");
  }
};


const logout = async (_req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.status(200).send('Logged out successfully');
};

export { register, login, logout, refreshToken };