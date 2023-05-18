export type PathmapErrorCode =
  | "INVALID_CONFIG"
  | "ROUTER_DIR_NOT_FOUND"
  | "NO_ROUTES_FOUND";

export class PathmapError extends Error {
  override readonly name = "PathmapError";
  readonly code: PathmapErrorCode;

  constructor(code: PathmapErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.code = code;
  }
}
