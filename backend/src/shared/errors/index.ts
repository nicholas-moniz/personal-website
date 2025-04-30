import { BaseHttpError } from "@/shared/errors/BaseHttpError";

interface ErrorOptions {
  message?: string;
  errors?: string[];
}

export class BadRequestError extends BaseHttpError {
  constructor(options: ErrorOptions = {}) {
    super({ statusCode: 400, message: "Bad Request", ...options });
  }
}

export class UnauthorizedError extends BaseHttpError {
  constructor(options: ErrorOptions = {}) {
    super({ statusCode: 401, message: "Unauthorized", ...options });
  }
}

export class ForbiddenError extends BaseHttpError {
  constructor(options: ErrorOptions = {}) {
    super({ statusCode: 403, message: "Forbidden", ...options });
  }
}

export class NotFoundError extends BaseHttpError {
  constructor(options: ErrorOptions = {}) {
    super({ statusCode: 404, message: "Not Found", ...options });
  }
}

export class TooManyRequestsError extends BaseHttpError {
  constructor(options: ErrorOptions = {}) {
    super({ statusCode: 429, message: "Too Many Requests", ...options });
  }
}

export class InternalServerError extends BaseHttpError {
  constructor(options: ErrorOptions = {}) {
    super({ statusCode: 500, message: "Internal Server Error", ...options });
  }
}

export class BadGatewayError extends BaseHttpError {
  constructor(options: ErrorOptions = {}) {
    super({ statusCode: 502, message: "Bad Gateway", ...options });
  }
}

export class ServiceUnavailableError extends BaseHttpError {
  constructor(options: ErrorOptions = {}) {
    super({ statusCode: 503, message: "Service Unavailable", ...options });
  }
}

export class GatewayTimeoutError extends BaseHttpError {
  constructor(options: ErrorOptions = {}) {
    super({ statusCode: 504, message: "Gateway Timeout", ...options });
  }
}