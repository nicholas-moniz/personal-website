import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { logger } from "@/middleware/logger";
import { errorHandler } from "@/middleware/errorHandler";
import { NotFoundError } from "@/utils/errors/index";
import { sendResponse } from "@/utils/functions/index";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(errorHandler);

app.get("/api/health", (req: Request, res: Response) => {
    sendResponse({ res, status: "success", message: "Express is healthy", statusCode: 200, errors: [] });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

app.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}`);
});