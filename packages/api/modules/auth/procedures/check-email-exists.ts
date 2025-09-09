import { z } from 'zod';
import { publicProcedure } from '../../../trpc/base';
import { TRPCError } from '@trpc/server';

export const checkEmailExists = publicProcedure
    .input(z.object({
      email: z.string().email(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const normalizedEmail = input.email.trim().toLowerCase();
        
        const existingUser = await ctx.prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: { id: true }
        });
        
        return { 
          exists: !!existingUser,
          email: normalizedEmail
        };
      } catch (error) {
        console.error('Check email exists error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check email existence',
        });
      }
    });
