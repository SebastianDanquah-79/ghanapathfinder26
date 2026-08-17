import { createFileRoute } from '@tanstack/react-router'

const TARGET = 'https://hodvuidwrhlaildtcpww.supabase.co/functions/v1/mcp'

async function proxy({ request }: { request: Request }) {
  const incoming = new URL(request.url)
  const target = new URL(TARGET)
  target.search = incoming.search

  const headers = new Headers(request.headers)
  headers.delete('host')
  headers.delete('content-length')

  const hasBody = !['GET', 'HEAD', 'OPTIONS'].includes(request.method)

  const response = await fetch(target.toString(), {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: 'manual',
    // @ts-expect-error - required by undici/workers when streaming a request body
    duplex: hasBody ? 'half' : undefined,
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete('content-encoding')
  responseHeaders.delete('content-length')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

export const Route = createFileRoute('/functions/v1/mcp')({
  server: {
    handlers: {
      GET: proxy,
      POST: proxy,
      PUT: proxy,
      PATCH: proxy,
      DELETE: proxy,
      OPTIONS: proxy,
      HEAD: proxy,
    },
  },
})
