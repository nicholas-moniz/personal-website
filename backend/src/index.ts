import express, { Request, Response, NextFunction } from "express";
import { NotFoundError } from "@/shared/errors/index";
import { sendResponse } from "@/shared/functions/index";
import { useAppMiddleware } from "./middleware/app";

const app = express();
const PORT = process.env.PORT || 8080;

useAppMiddleware(app);

app.get("/api/health", (req: Request, res: Response) => {
    sendResponse({ res, status: "success", message: "Express is healthy", statusCode: 200, data: [], errors: [] });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError({ errors: [`Route ${req.method} ${req.originalUrl} does not exist`]}));
});

app.listen(PORT, async () => { 
    console.log(`Server running at http://localhost:${PORT}`);
});