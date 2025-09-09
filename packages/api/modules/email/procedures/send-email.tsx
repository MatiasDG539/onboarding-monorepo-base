import { render } from "@react-email/render";
import { createTransporter } from "../config";
import { ActivationEmail } from "../templates/activation-email";
import { TRPCError } from '@trpc/server';
import prisma from 'database';

export async function sendEmail(to: string): Promise<{ code: string }> {
	if (!to) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: 'Email required',
		});
	}
	
	const normalizedEmail = to.trim().toLowerCase();
	
	try {
		const user = await prisma.user.findUnique({
			where: { email: normalizedEmail },
			select: { verificationCode: true }
		});

		if (!user) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'User not found',
			});
		}

		const code = user.verificationCode.toString();
		
		const transporter = createTransporter();
		const html = render(<ActivationEmail code={code} />);
		await transporter.sendMail({
			from: process.env.EMAIL_FROM || "gutierrezmatiasdaniel539@gmail.com",
			to: normalizedEmail,
			subject: "Activation code",
			html,
		});
		return { code };

	} catch (err) {
		if (err instanceof TRPCError) {
			throw err;
		}
		console.error('Send email error:', err);
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: 'Error sending email',
		});
	}
}