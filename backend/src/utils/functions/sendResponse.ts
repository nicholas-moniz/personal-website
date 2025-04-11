import { Response } from "express";

interface SendResponseParams<T> {
    res: Response;
    status: "success" | "error";
    statusCode: number;
    message: string;
    data?: T[];
    errors?: string[];
}

export function sendResponse<T>({ res, status, message, statusCode, data = [], errors = [] }: SendResponseParams<T>) {
    return res.status(statusCode).json({
        status,
        message,
        data,
        errors,
    });
}