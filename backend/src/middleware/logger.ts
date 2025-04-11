import { Request, Response, NextFunction } from "express";

export const logger = (req: Request, response: Response, next: NextFunction) => {
    const now = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const body = Object.keys(req.body).length ? JSON.stringify(req.body) : '';

    console.log(`[${now}] ${method} ${url}`);
    if (body) console.log(`Body: ${body}`);

    next();
};
