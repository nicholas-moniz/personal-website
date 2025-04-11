import { BaseHttpError } from "@/utils/errors/BaseHttpError";

export class BadRequestError extends BaseHttpError {
    constructor(message = "Bad Request", errors?: string[]) {
        super(message, 400, errors);
    }
}

export class UnauthorizedError extends BaseHttpError {
    constructor(message = "Unauthorized", errors?: string[]) {
        super(message, 401, errors);
    }
}

export class ForbiddenError extends BaseHttpError {
    constructor(message = "Forbidden", errors?: string[]) {
        super(message, 403, errors);
    }
}

export class NotFoundError extends BaseHttpError {
    constructor(message = "Not Found", errors?: string[]) {
        super(message, 404, errors);
    }
}