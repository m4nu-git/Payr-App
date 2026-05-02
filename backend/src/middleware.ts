import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload as BaseJwtPayload } from "jsonwebtoken";
import  { config }  from "./config";

export interface AuthRequest extends Request {
  userId?: string;
}

interface JwtPayload extends BaseJwtPayload {
  userId: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as unknown as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};