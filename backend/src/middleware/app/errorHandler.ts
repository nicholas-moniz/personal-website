import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@/shared/functions/index";
import { BaseHttpError } from "@/shared/errors/BaseHttpError";
import { Prisma } from "@prisma/client";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: string[] = [err.message];

  if (err instanceof BaseHttpError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors ?? [];
  }

  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;

    switch (err.code) {
      case "P2002":
        message = "Unique constraint failed";
        errors = [`${(err.meta?.target as string[]).join(", ")} must be unique`];
        break;

      case "P2025":
        message = "Record not found";
        errors = ["The requested resource does not exist"];
        break;

      default:
        message = "Database error";
        errors = [err.message];
    }
  }

  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Prisma validation error";
    errors = [err.message];
  }

  else if (err instanceof Prisma.PrismaClientInitializationError || err instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = 500;
    message = "Database initialization error";
    errors = [err.message];
  }

  sendResponse({ res, status: "error", message, statusCode, errors });
};