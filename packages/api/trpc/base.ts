import { initTRPC } from '@trpc/server';
import type { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const mergeRouters = <T extends Record<string, any>>(rs: T) => {
  return Object.assign({}, rs) as T;
};

export type Router = typeof router;
