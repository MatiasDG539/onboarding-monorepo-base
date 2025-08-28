import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@api/trpc/router';
import { createContext } from '@api/trpc/context';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    // Reconstruir la request con el body
    const reqWithBody = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body,
    });
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req: reqWithBody,
      router: appRouter,
      createContext: async () => createContext({ req: reqWithBody }),
    });
    return response;
  } catch (err) {
    console.error('[tRPC POST] Error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const response = await fetchRequestHandler({
      endpoint: '/api/trpc',
      req: request,
      router: appRouter,
      createContext: async () => createContext({ req: request }),
    });
    return response;
  } catch (err) {
    console.error('[tRPC GET] Error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}
