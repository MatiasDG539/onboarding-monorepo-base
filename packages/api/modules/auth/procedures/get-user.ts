import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/base';

export const getUserRouter = router({
  getUser: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.findFirst({
          where: {
            OR: [
              { email: input },
              { username: input },
              { id: input }
            ]
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            isVerified: true,
          }
        });
        
        return user;
      } catch (error) {
        console.error('Get user error:', error);
        return null;
      }
    }),
});
