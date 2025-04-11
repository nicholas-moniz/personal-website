import express, { Request, Response, NextFunction } from "express";
import { logger } from "@/middleware/logger";
import { errorHandler } from "@/middleware/errorHandler";
import { NotFoundError } from "@/utils/errors/index";
import { testConnection } from "@/db";

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(logger);
app.use(errorHandler);

app.all("*", (req: Request, res: Response, next: NextFunction) => {
    next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

app.listen(PORT, async () => {
    await testConnection();
    console.log(`Server running at http://localhost:${PORT}`);
});