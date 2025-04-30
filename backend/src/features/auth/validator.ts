import { z } from "zod";

const nameRegex = /^[a-zA-ZÀ-ÖØ-öø-ÿ' -]{2,}$/;
const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).{8,}$/;

export const loginSchema = {
  body: z.union([
    z.object({
      email: z.string().trim().email("Invalid email format"),
      password: z.string().min(1, "Password is required"),
    }),
    z.object({
      username: z.string().trim().min(1, "Username is required"),
      password: z.string().min(1, "Password is required"),
    }),
  ]),
};

export const registerSchema = {
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Invalid email format")
      .max(255),

    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be at most 20 characters")
      .regex(usernameRegex, "Username must be alphanumeric and contain no spaces"),

    password: z
      .string()
      .trim()
      .regex(
        passwordRegex,
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character"
      ),

    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name too long")
      .regex(nameRegex, "First name contains invalid characters"),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name too long")
      .regex(nameRegex, "Last name contains invalid characters"),
  }),
};

export type LoginDTO = z.infer<typeof loginSchema.body>;
export type RegisterDTO = z.infer<typeof registerSchema.body>;