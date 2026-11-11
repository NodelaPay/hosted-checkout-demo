export type DomainErrorCode = "invalid_input" | "not_found" | "conflict";

export class DomainError extends Error {
  constructor(
    readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
  }
}
