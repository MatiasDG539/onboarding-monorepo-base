import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '../../../../../packages/api/trpc/router';

export default createNextApiHandler({
  router: appRouter,
});
