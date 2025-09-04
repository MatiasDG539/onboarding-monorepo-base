import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/base';

export const updateProfileRouter = router({
  updateProfile: publicProcedure
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
        
        return { success: true, user };
      } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: 'Failed to update profile' };
      }
    }),
});
