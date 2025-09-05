import { z } from 'zod';
import { publicProcedure } from '../../../trpc/base';
import { TRPCError } from '@trpc/server';

export const toggleLike = publicProcedure
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
          return { liked: false };
        } else {
          await ctx.prisma.like.create({
            data: input
          });
          return { liked: true };
        }
      } catch (error) {
        console.error('Toggle like error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to toggle like',
        });
      }
    });
