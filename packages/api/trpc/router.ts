import { router } from './base';
import { publicProcedure } from './base';
import { sendEmail } from '../modules/email/procedures';
import { verifyCode } from '../modules/auth/procedures';
import { z } from 'zod';

export const emailRouter: any = router({
  sendActivationEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }: { input: { email: string } }) => {
      const result = await sendEmail(input.email);
      return {
        success: result.success,
        error: result.error,
        code: result.code ? 'Code sent successfully' : undefined,
      };
    }),
});

export const authRouter: any = router({
  verifyCode: publicProcedure
    .input(z.object({ email: z.string().email(), code: z.string() }))
    .query(({ input }: { input: { email: string; code: string } }) => {
      const isValid = verifyCode(input.email, input.code);
      return {
        success: isValid,
        error: isValid ? undefined : 'Invalid verification code',
      };
    }),
});

export const appRouter: any = router({
  email: emailRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
