import { z } from 'zod';
import { publicProcedure } from '../../../trpc/base';
import { TRPCError } from '@trpc/server';
import bcrypt from 'bcryptjs';

export const login = publicProcedure
    .input(z.object({
      emailOrPhone: z.string(),
      password: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const user = await ctx.prisma.user.findFirst({
          where: {
            OR: [
              { email: input.emailOrPhone },
              { username: input.emailOrPhone }
            ]
          }
        });

        if (!user) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'User not found',
          });
        }

        const isValidPassword = await bcrypt.compare(input.password, user.password);
        
        if (!isValidPassword) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid password',
          });
        }

        if (!user.isVerified) {
          throw new TRPCError({
            code: 'PRECONDITION_FAILED',
            message: 'Please verify your email before signing in',
          });
        }

        return {
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
          }
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('Login error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Login failed',
        });
      }
    });
