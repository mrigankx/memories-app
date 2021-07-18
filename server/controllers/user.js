import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const signin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existinguser = await User.findOne({ email });
    if (!existinguser)
      return res.status(404).json({ message: "User doesn't exists" });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existinguser.password
    );
    if (!isPasswordCorrect)
      return res.status(404).json({ message: "Invalid credentials!!" });
    const token = jwt.sign(
      { email: existinguser.email, id: existinguser._id },
      process.env.SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ result: existinguser, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

export const signup = async (req, res) => {
  const { firstname, lastname, email, password, confirmPassword } = req.body;
  try {
    const existinguser = await User.findOne({ email });
    if (existinguser)
      return res.status(400).json({ message: "User already exists" });
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords don't match" });
    const hash = await bcrypt.hash(password, 12);
    const result = await User.create({
      email,
      password: hash,
      name: `${firstname} ${lastname}`,
    });
    const token = jwt.sign(
      { email: result.email, id: result._id },
      process.env.SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ result, token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};
