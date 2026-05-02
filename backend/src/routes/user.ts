import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { Account, User } from "../db";
import { config } from "../config";
import { authMiddleware, AuthRequest } from "../middleware";


const router = Router();

// Zod Schemas
const signupSchema = z.object({
  username: z.string().min(3).max(30).transform(val => val.toLowerCase()),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
});

const signinSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const updateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

// POST /user/signup
router.post("/signup", async (req, res: Response): Promise<void> => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });
    return;
  }

  const { username, email, password, firstName, lastName } = parsed.data;

  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      res.status(409).json({ message: "Username or email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword, firstName, lastName });

    // Create account with random balance between 1000 and 10000
    const balance = Math.floor(Math.random() * 9000) + 1000;
    await Account.create({ userId: user._id, balance });

    const token = jwt.sign({ userId: user._id.toString() }, config.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { id: user._id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// POST /user/signin
router.post("/signin", async (req, res: Response): Promise<void> => {
  const parsed = signinSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });
    return;
  }

  const { username, password } = parsed.data;

  try {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user._id.toString() }, config.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Signed in successfully",
      token,
      user: { id: user._id, username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// PUT /user/ (protected) - Update user info
router.put("/", authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Validation failed", errors: parsed.error.issues });
    return;
  }

  const updates = parsed.data;

  try {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// GET /user/bulk?filter=
router.get("/bulk", async (req, res: Response): Promise<void> => {
  const filter = (req.query.filter as string) || "";

  try {
    const users = await User.find({
      $or: [
        { firstName: { $regex: filter, $options: "i" } },
        { lastName: { $regex: filter, $options: "i" } },
        { username: { $regex: filter, $options: "i" } },
      ],
    })
      .select("_id username firstName lastName email")
      .limit(20);

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

export default router;