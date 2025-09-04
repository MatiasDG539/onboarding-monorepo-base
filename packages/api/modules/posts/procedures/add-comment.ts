import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/base';

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
          data: {
            content: input.content,
            postId: input.postId,
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
            }
          }
        });
        
        return { success: true, comment };
      } catch (error) {
        console.error('Add comment error:', error);
        return { success: false, error: 'Failed to add comment' };
      }
    }),
});
