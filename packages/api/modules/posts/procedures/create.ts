import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/base';

export const createPostRouter = router({
  create: publicProcedure
    .input(z.object({
      content: z.string().min(1),
      authorId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const post = await ctx.prisma.post.create({
          data: {
            content: input.content,
            authorId: input.authorId,
          },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                avatar: true,
              }
            },
            comments: {
              include: {
                author: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    avatar: true,
                  }
                }
              }
            },
            likes: true,
          }
        });
        
        return { success: true, post };
      } catch (error) {
        console.error('Create post error:', error);
        return { success: false, error: 'Failed to create post' };
      }
    }),
});
