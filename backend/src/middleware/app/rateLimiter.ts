import rateLimit from "express-rate-limit";
import { TooManyRequestsError } from "@/shared/errors";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    next(new TooManyRequestsError({errors: ["Too many requests, please try again later."]}));
  }
});