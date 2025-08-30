import { router, publicProcedure } from './base';
import { sendEmail } from '../modules/email/procedures';
import { authRouter } from '../modules/auth/procedures';
import { z } from 'zod';

const sendEmailInput = z.object({ to: z.string().email() });

export const emailRouter = router({
  sendActivationEmail: publicProcedure
    .input(sendEmailInput)
    .mutation(async ({ input }: { input: { to: string } }) => {
      const result = await sendEmail(input.to);
      return {
        success: result.success,
        error: result.error,
        code: result.code ? 'Code sent successfully' : undefined,
      };
    }),
});

export const appRouter = router({
  email: emailRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
