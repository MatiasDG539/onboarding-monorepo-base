
import { z } from "zod";
import { router, publicProcedure } from '../../../trpc/base';
import { codes } from "../../email/procedures/send-email";

const verifyCodeInputSchema = z.object({
	email: z.string().email(),
	code: z.string(),
});

export const verifyCodeRouter = router({
	verify: publicProcedure
		.input(verifyCodeInputSchema)
		.mutation(({ input }) => {
			const normalizedEmail = input.email.trim().toLowerCase();
			const storedCode = codes.get(normalizedEmail);
			if (!storedCode) {
				return { valid: false };
			}
			const normalizedStored = String(storedCode).trim();
			const normalizedInput = String(input.code).trim();
			return { valid: normalizedStored === normalizedInput };
		})
});