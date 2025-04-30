import { Router } from "express";
import { login, register, verifyEmail } from "./controller";
import { loginSchema, registerSchema } from "./validator";
import { validateRequest } from "@/middleware/router/validateRequest";
import { asyncHandler } from "@/shared/functions";

const router = Router();

router.post("/login", validateRequest(loginSchema), asyncHandler(login));

router.post("/register", validateRequest(registerSchema), asyncHandler(register));

router.get("/verify-email", asyncHandler(verifyEmail));

export default router;
