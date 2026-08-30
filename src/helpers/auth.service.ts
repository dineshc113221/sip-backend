import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";

// Middleware to verify token
export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;
    const decoded = decodeToken(token);
    if (!decoded) {
      return res.status(httpStatus.UNAUTHORIZED).send();
    } else {
      // Attach decoded user data to res.locals for later use
      res.locals.user = decoded;
      return next();
    }
  } catch (error) {
    console.error("Error while verifying token", error);
    return res.status(httpStatus.UNAUTHORIZED).send();
  }
};

// Function to decode token
const decodeToken = (token: string | undefined) => {
  if (!token) return false;
  if (token.includes("Bearer")) {
    token = token.slice(8, token.length-1).trimLeft();
  }
  return jwt.decode(token);
};
