import { ERROR_STATUS, type ErrorCode, type ErrorDetail } from "@tasksight/shared";

// Throw this anywhere in the API. The central handler turns it into the contract error shape.
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: ErrorDetail[];

  constructor(code: ErrorCode, message: string, details?: ErrorDetail[]) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = ERROR_STATUS[code];
    if (details) this.details = details;
  }
}
