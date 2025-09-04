import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '../../../../../packages/api/trpc/router';
import { createContext } from '../../../../../packages/api/trpc/context';

export default createNextApiHandler({
  router: appRouter,
  createContext,
});
