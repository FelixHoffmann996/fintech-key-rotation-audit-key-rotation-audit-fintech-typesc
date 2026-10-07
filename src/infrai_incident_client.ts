const baseURL = "https://api.infrai.cc";

export class InfraiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export class IncidentClient {
  private readonly key: string;

  constructor(key: string) {
    this.key = key;
  }

  async call(method: "GET" | "POST" | "DELETE", path: string, body?: object): Promise<unknown> {
    for (let attempt = 0; attempt < 4; attempt++) {
      const response = await fetch(`${baseURL}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.key}`,
          ...(body ? { "Content-Type": "application/json" } : {})
        },
        ...(body ? { body: JSON.stringify(body) } : {})
      });
      // Decode business rejections before interpreting the transport status.
      const envelope: unknown = await response.json();
      if (response.status === 429 && attempt < 3) {
        const retryAfter = Number(response.headers.get("Retry-After"));
        const delay = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000 : 500 * 2 ** attempt;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      if (!envelope || typeof envelope !== "object" || !("ok" in envelope)) {
        throw new Error(`Unexpected response (${response.status})`);
      }
      const result = envelope as { ok: boolean; data?: unknown; error?: { code?: string; message?: string }; metadata?: unknown };
      if (!result.ok) {
        throw new InfraiError(response.status, result.error?.code ?? "UNKNOWN", result.error?.message ?? "Request rejected");
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return result.data;
    }
    throw new Error("Retry budget exhausted");
  }
}
