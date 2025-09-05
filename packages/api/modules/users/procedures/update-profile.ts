import { z } from 'zod';
import { publicProcedure } from '../../../trpc/base';
import { TRPCError } from '@trpc/server';

export const updateProfile = publicProcedure
    .input(z.object({
      userId: z.string(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      avatar: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { userId, ...updateData } = input;
        
        const user = await ctx.prisma.user.update({
          where: { id: userId },
          data: updateData,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            avatar: true,
            isVerified: true,
          }
        });
        
        return { user };
      } catch (error) {
        console.error('Update profile error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
        });
      }
    });
