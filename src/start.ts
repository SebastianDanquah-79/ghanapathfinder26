import { createStart, createMiddleware } from "@tanstack/react-start";
import * as startClientCore from "@tanstack/start-client-core";

import { renderErrorPage } from "./lib/error-page";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs CSRF protection automatically when src/start.ts is absent;
// defining this file opts out, so re-add it explicitly. Resolved at runtime
// because some hosted bundlers (Vercel/Nitro node output) have shipped builds
// where the named re-export resolves to undefined — a hard import crashes the
// whole SSR entry with "createCsrfMiddleware is not a function".
const createCsrf = (startClientCore as Record<string, unknown>)["createCsrfMiddleware"] as
  | typeof startClientCore.createCsrfMiddleware
  | undefined;

const csrfMiddleware =
  typeof createCsrf === "function"
    ? createCsrf({ filter: (ctx) => ctx.handlerType === "serverFn" })
    : undefined;

if (!csrfMiddleware) {
  console.error(
    new Error(
      "createCsrfMiddleware unavailable from @tanstack/start-client-core; continuing without CSRF middleware",
    ),
  );
}

export const startInstance = createStart(() => ({
  requestMiddleware: csrfMiddleware ? [errorMiddleware, csrfMiddleware] : [errorMiddleware],
}));

