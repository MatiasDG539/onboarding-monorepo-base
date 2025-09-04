import { router, publicProcedure } from './base';
import { sendEmail } from '../modules/email/procedures';
import { authRouter } from '../modules/auth/procedures';
import { usersRouter } from '../modules/users/procedures';
import { postsRouter } from '../modules/posts/procedures';
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
  auth: authRouter,
  users: usersRouter,
  posts: postsRouter,
});

export type AppRouter = typeof appRouter;
