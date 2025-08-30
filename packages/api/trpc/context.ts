export async function createContext(opts?: { req?: any; res?: any } | undefined) {
  const { req, res } = opts || {};

  return {
    userId: undefined, // TODO: Implement authentication
    req,
    res,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
