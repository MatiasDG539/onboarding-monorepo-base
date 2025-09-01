import prisma from '../../database';

export async function createContext(opts?: { req?: any; res?: any } | undefined) {
  const { req, res } = opts || {};

  return {
    userId: undefined,
    req,
    res,
    prisma,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
