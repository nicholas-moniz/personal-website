export class BaseHttpError extends Error {
    public statusCode: number;
    public errors?: string[];

    constructor(message: string, statusCode: number, errors?: string[]) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
