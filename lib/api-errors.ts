export type ChatErrorCode =
  | "RATE_LIMITED"
  | "SCENARIO_NOT_FOUND"
  | "INVALID_REQUEST"
  | "MESSAGE_TOO_LONG"
  | "AI_UNAVAILABLE"
  | "NOT_CONFIGURED";

export interface ChatErrorBody {
  code: ChatErrorCode;
  message: string;
  retryAfterMs?: number;
}

type JsonErrorExtras = Partial<Pick<ChatErrorBody, "retryAfterMs">> & {
  headers?: HeadersInit;
};

export function jsonError(
  code: ChatErrorCode,
  message: string,
  status: number,
  extras: JsonErrorExtras = {}
): Response {
  const headers = new Headers(extras.headers);
  headers.set("content-type", "application/json");

  const body: ChatErrorBody = {
    code,
    message,
    ...(extras.retryAfterMs === undefined ? {} : { retryAfterMs: extras.retryAfterMs }),
  };

  return new Response(JSON.stringify(body), { status, headers });
}
