import { UserModel } from "@/shared/models";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "@/shared/errors";
import nodemailer from "nodemailer";

interface LoginInput {
  email?: string;
  username?: string;
  password: string;
}

console.log("teststarted");

export const loginLocalUser = async ({ email, username, password }: LoginInput) => {
  const user: User | null = await UserModel.findFirst({
    where: {
      OR: [{ email }, { username }],
      deletedAt: null,
    },
  });

  if (!user || !user.password) {
    throw new UnauthorizedError({ errors: ["Invalid credentials"] });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError({ errors: ["Invalid credentials"] });
  }

  if (!user.emailVerified) {
    const token = jwt.sign({ userId: user.id }, process.env.EMAIL_VERIFICATION_SECRET!, { expiresIn: "15m" });

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    await sendVerificationEmail(user.email, verifyLink);

    throw new ForbiddenError({ errors: ["Email not verified. A verification link has been sent."] });
  }

  const jwtToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET_KEY!, { expiresIn: "1h" });

  await UserModel.update({ where: { id: user.id }, data: { lastLogin: new Date() }});

  return {
    token: jwtToken,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  };
};

const sendVerificationEmail = async (to: string, verifyLink: string) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Nicholas Moniz - Verify Your Email",
    html: `
      <p>Click the link below to verify your email address:</p>
      <a href="${verifyLink}">${verifyLink}</a>
    `,
  }).catch((err) => {
    console.error("Failed to send verification email for reason: ", err.message);
  });
};