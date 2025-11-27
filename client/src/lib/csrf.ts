const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";

const SAME_ORIGIN_PROTOCOLS = new Set(["http:", "https:"]);

type FetchInput = Parameters<typeof fetch>[0];
type FetchInit = Parameters<typeof fetch>[1];

let csrfFetchInstalled = false;

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie?.split(";") ?? [];
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key?.trim() === name) {
      return decodeURIComponent(value ?? "");
    }
  }

  return null;
}

function shouldAttachCsrf(input: FetchInput): boolean {
  if (globalThis.window === undefined) return false;
  const origin = globalThis.location?.origin;
  if (!origin) return false;

  const resolveUrl = (target: string): URL | null => {
    if (!target) return null;
    try {
      if (target.startsWith("/")) {
        return new URL(target, origin);
      }
      const parsed = new URL(target);
      return parsed;
    } catch {
      return null;
    }
  };

  if (typeof input === "string") {
    const targetUrl = resolveUrl(input);
    return targetUrl?.origin === origin;
  }

  if (input instanceof URL) {
    return SAME_ORIGIN_PROTOCOLS.has(input.protocol) && input.origin === origin;
  }

  const RequestCtor = globalThis.Request;
  if (RequestCtor !== undefined && input instanceof RequestCtor) {
    return shouldAttachCsrf(input.url);
  }

  return false;
}

export function getCsrfToken(): string | null {
  return getCookie(CSRF_COOKIE_NAME);
}

export function withCsrfHeader(headers: Record<string, string> = {}): Record<string, string> {
  const csrfToken = getCsrfToken();
  if (!csrfToken) return headers;
  return {
    ...headers,
    [CSRF_HEADER_NAME]: csrfToken,
  };
}

export function installCsrfFetchInterceptor(): void {
  if (csrfFetchInstalled || typeof globalThis.fetch !== "function") return;
  if (globalThis.window === undefined) return;

  const originalFetch = globalThis.fetch.bind(globalThis);
  csrfFetchInstalled = true;

  globalThis.fetch = (input: FetchInput, init?: FetchInit) => {
    if (!shouldAttachCsrf(input)) {
      return originalFetch(input, init);
    }

    const HeadersCtor = globalThis.Headers;
    if (HeadersCtor === undefined) {
      return originalFetch(input, init);
    }

    const RequestCtor = globalThis.Request;
    const inheritedHeaders =
      RequestCtor !== undefined && input instanceof RequestCtor
        ? input.headers
        : undefined;

    const headers = new HeadersCtor(init?.headers ?? inheritedHeaders);
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers.set(CSRF_HEADER_NAME, csrfToken);
    }

    const nextInit: FetchInit = {
      ...init,
      headers,
      credentials: init?.credentials ?? "include",
    };

    return originalFetch(input, nextInit);
  };
}
