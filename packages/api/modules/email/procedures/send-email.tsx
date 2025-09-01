import { render } from "@react-email/render";
import { createTransporter } from "../config";
import { ActivationEmail } from "../templates/activation-email";
import prisma from 'database';

export async function sendEmail(to: string): Promise<{ success: boolean; error?: string; code?: string }> {
	if (!to) {
		return { success: false, error: "Email required" };
	}
	
	const normalizedEmail = to.trim().toLowerCase();
	
	try {
		const user = await prisma.user.findUnique({
			where: { email: normalizedEmail },
			select: { verificationCode: true }
		});

		if (!user) {
			return { success: false, error: "User not found" };
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
		return { success: true, code };

	} catch (err) {
		console.error('Send email error:', err);

		return { success: false, error: "Error sending email" };
	}
}