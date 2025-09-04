import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/base';

export const getProfileRouter = router({
  getProfile: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: { id: input },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            avatar: true,
            isVerified: true,
            posts: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                likes: true,
                comments: true,
              },
              orderBy: { createdAt: 'desc' }
            },
          }
        });
        
        return user;
      } catch (error) {
        console.error('Get profile error:', error);
        return null;
      }
    }),
});
