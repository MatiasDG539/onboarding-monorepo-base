import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/base';

export const toggleLikeRouter = router({
  toggleLike: publicProcedure
    .input(z.object({
      postId: z.string(),
      authorId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const existingLike = await ctx.prisma.like.findFirst({
          where: {
            postId: input.postId,
            authorId: input.authorId,
          }
        });

        if (existingLike) {
          await ctx.prisma.like.delete({
            where: { id: existingLike.id }
          });
          return { success: true, liked: false };
        } else {
          await ctx.prisma.like.create({
            data: {
              postId: input.postId,
              authorId: input.authorId,
            }
          });
          return { success: true, liked: true };
        }
      } catch (error) {
        console.error('Toggle like error:', error);
        return { success: false, error: 'Failed to toggle like' };
      }
    }),
});
