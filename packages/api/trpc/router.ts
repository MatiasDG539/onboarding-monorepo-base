import { router, publicProcedure } from './base';
import { sendEmail } from '../modules/email/procedures';
import * as authProcedures from '../modules/auth/procedures';
import * as usersProcedures from '../modules/users/procedures';
import * as postsProcedures from '../modules/posts/procedures';
import { z } from 'zod';

const sendEmailInput = z.object({ to: z.string().email() });

export const emailRouter = router({
  sendActivationEmail: publicProcedure
    .input(sendEmailInput)
    .mutation(async ({ input }: { input: { to: string } }) => {
      const result = await sendEmail(input.to);
      return {
        code: 'Code sent successfully',
      };
    }),
});

export const appRouter = router({
  email: emailRouter,
  auth: router(authProcedures),
  users: router(usersProcedures),
  posts: router(postsProcedures),
});

export type AppRouter = typeof appRouter;
