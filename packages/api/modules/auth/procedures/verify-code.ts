
import { z } from "zod";
import { publicProcedure } from '../../../trpc/base';
import { TRPCError } from '@trpc/server';

const verifyCodeInputSchema = z.object({
	email: z.string().email(),
	code: z.string(),
});

export const verifyCode = publicProcedure
	.input(verifyCodeInputSchema)
	.mutation(async ({ input, ctx }) => {
		try {
			const user = await ctx.prisma.user.findUnique({
				where: { email: input.email.trim().toLowerCase() }
			});

			if (!user) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not found',
				});
			}

			const inputCode = parseInt(input.code.trim());

			if (user.verificationCode !== inputCode) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Invalid verification code',
				});
			}

			await ctx.prisma.user.update({
				where: { id: user.id },
				data: { isVerified: true }
			});

			return { success: true };
		} catch (error) {
			if (error instanceof TRPCError) {
				throw error;
			}
			console.error('Verification error:', error);
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Verification failed',
			});
		}
	})