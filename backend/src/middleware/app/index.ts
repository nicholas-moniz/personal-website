import express, { Express } from 'express';
import cors from "cors";
import xssClean from 'xss-clean';
import { trimStrings } from './trimStrings';
import { sanitizeInput } from './sanitizeInput';
import { rateLimiter } from './rateLimiter';
import { logger } from './logger';
import { errorHandler } from './errorHandler';

export const useAppMiddleware = (app: Express) => {
    app.use(express.json());
    app.use(cors());
    app.use(logger);           
    app.use(rateLimiter);      
    app.use(trimStrings);
    app.use(xssClean());      
    app.use(sanitizeInput);   
    app.use(errorHandler);
};