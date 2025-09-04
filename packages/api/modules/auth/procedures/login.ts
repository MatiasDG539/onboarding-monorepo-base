import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/base';
import bcrypt from 'bcryptjs';

export const loginRouter = router({
  login: publicProcedure
    .input(z.object({
      emailOrPhone: z.string(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.findFirst({
          where: {
            OR: [
              { email: input.emailOrPhone },
              { username: input.emailOrPhone }
            ]
          }
        });

        if (!user) {
          return { success: false, error: 'User not found' };
        }

        const isValidPassword = await bcrypt.compare(input.password, user.password);
        
        if (!isValidPassword) {
          return { success: false, error: 'Invalid password' };
        }

        if (!user.isVerified) {
          return { success: false, error: 'Please verify your email before signing in' };
        }

        return {
          success: true,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
          }
        };
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Login failed' };
      }
    }),
});
