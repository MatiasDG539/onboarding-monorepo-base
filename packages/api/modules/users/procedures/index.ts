import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/base';

export const usersRouter = router({
  // Obtener perfil de usuario
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

  // Actualizar perfil
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

  // Buscar usuarios
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
