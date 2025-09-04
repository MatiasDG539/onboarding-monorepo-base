import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/base';

export const searchUsersRouter = router({
  searchUsers: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().optional().default(10),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const users = await ctx.prisma.user.findMany({
          where: {
            OR: [
              { firstName: { contains: input.query, mode: 'insensitive' } },
              { lastName: { contains: input.query, mode: 'insensitive' } },
              { username: { contains: input.query, mode: 'insensitive' } },
              { email: { contains: input.query, mode: 'insensitive' } },
            ]
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
            isVerified: true,
          },
          take: input.limit,
        });
        
        return users;
      } catch (error) {
        console.error('Search users error:', error);
        return [];
      }
    }),
});
