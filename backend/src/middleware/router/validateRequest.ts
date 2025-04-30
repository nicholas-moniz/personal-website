import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { BadRequestError } from "@/shared/errors";

type RequestSchemas = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export const validateRequest = (schemas: RequestSchemas) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map(e => `${e.path.join(".")}: ${e.message}`);
        throw new BadRequestError({ errors });
      }

      next(err);
    }
  };
};
