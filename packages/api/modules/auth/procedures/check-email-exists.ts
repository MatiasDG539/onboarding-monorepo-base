import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/base';

export const checkEmailExistsRouter = router({
  checkEmailExists: publicProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const normalizedEmail = input.email.trim().toLowerCase();
        
        const existingUser = await ctx.prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: { id: true }
        });
        
        return { 
          exists: !!existingUser,
          email: normalizedEmail
        };
      } catch (error) {
        console.error('Check email exists error:', error);
        return { exists: false, email: input.email };
      }
    }),
});
