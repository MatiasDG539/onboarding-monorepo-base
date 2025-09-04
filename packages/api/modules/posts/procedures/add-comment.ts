import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/base';
import { TRPCError } from '@trpc/server';

export const addCommentRouter = router({
  addComment: publicProcedure
    .input(z.object({
      postId: z.string(),
      content: z.string().min(1),
      authorId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const comment = await ctx.prisma.comment.create({
          data: input,
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
        });
        
        return { comment };
      } catch (error) {
        console.error('Add comment error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add comment',
        });
      }
    }),
});
