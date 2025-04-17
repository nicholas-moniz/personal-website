import { Request, Response, NextFunction } from "express";
import { sendResponse } from "@/utils/functions/index";
import { BaseHttpError } from "@/utils/errors/BaseHttpError";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let errors: string[] = [err.message];

    if (err instanceof BaseHttpError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors ?? [];
    } /* else if (err instanceof ValidationError) {
        statusCode = 400;
        message = "Validation error";
        errors = err.errors.map(e => e.message);
    } */

    sendResponse({ res, status: "error", message, statusCode, errors });
};
