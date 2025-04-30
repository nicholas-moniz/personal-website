export interface HttpErrorOptions {
    message?: string;
    statusCode: number;
    errors?: string[];
  }
  
  export class BaseHttpError extends Error {
    public statusCode: number;
    public errors: string[];
  
    constructor({ message = "An error occurred", statusCode, errors = [] }: HttpErrorOptions) {
      super(message);
      this.statusCode = statusCode;
      this.errors = errors;
      this.name = new.target.name;
      Error.captureStackTrace(this, new.target);
    }
  }
   