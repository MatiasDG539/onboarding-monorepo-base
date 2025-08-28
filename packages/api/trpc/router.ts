import { router } from './base';
import { publicProcedure } from './base';
import { sendEmail } from '../modules/email/procedures';
import { verifyCode, registerUser } from '../modules/auth/procedures';
import { z } from 'zod';

const sendEmailInput = z.object({ to: z.string().email() });
const verifyCodeInput = z.object({ email: z.string().email(), code: z.string() });
const registerInput = z.object({
  emailOrPhone: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  phoneNumber: z.string(),
  birthdate: z.string(),
  profilePicture: z.any().optional(),
});

export const emailRouter = router({
  sendActivationEmail: publicProcedure
    .input(sendEmailInput)
    .mutation(async ({ input }) => {
      const result = await sendEmail(input.to);
      return {
        success: result.success,
        error: result.error,
        code: result.code ? 'Code sent successfully' : undefined,
      };
    }),
});

export const authRouter = router({
  verifyCode: publicProcedure
    .input(verifyCodeInput)
    .mutation(async ({ input }) => {
      const isValid = verifyCode(input.email, input.code);
      if (!isValid) {
        throw new Error('Invalid verification code');
      }
      return {
        success: true,
        message: 'Code verified successfully',
      };
    }),
  register: publicProcedure
    .input(registerInput)
    .mutation(async ({ input }) => {
      const result = registerUser(input);
      return result;
    }),
});

export const appRouter = router({
  email: emailRouter,
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
