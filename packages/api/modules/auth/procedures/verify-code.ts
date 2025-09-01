
import { z } from "zod";
import { router, publicProcedure } from '../../../trpc/base';

const verifyCodeInputSchema = z.object({
	email: z.string().email(),
	code: z.string(),
});

export const verifyCodeRouter = router({
	verify: publicProcedure
		.input(verifyCodeInputSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const user = await ctx.prisma.user.findUnique({
					where: { email: input.email.trim().toLowerCase() }
				});

				if (!user) {
					return { success: false, error: 'User not found' };
				}

				const inputCode = parseInt(input.code.trim());
				
				if (user.verificationCode === inputCode) {
					await ctx.prisma.user.update({
						where: { id: user.id },
						data: { isVerified: true }
					});
					
					return { success: true };
				}

				return { success: false, error: 'Invalid verification code' };
			} catch (error) {
				console.error('Verification error:', error);
				return { success: false, error: 'Verification failed' };
			}
		})
});