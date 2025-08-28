import type { CreateNextContextOptions } from '@trpc/server/adapters/next';

export async function createContext(opts?: CreateNextContextOptions) {
  const { req, res } = opts || {};

  return {
    userId: undefined, // TODO: Implement authentication
    req,
    res,
    // Add database connection here when available
    // db: prisma,
    // Add logging here when available
    // logger: winston,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
