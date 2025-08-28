import { render } from "@react-email/render";
import { createTransporter } from "../config";
import { ActivationEmail } from "../templates/activation-email";


const codes = new Map<string, string>();

export async function sendEmail(to: string): Promise<{ success: boolean; error?: string; code?: string }> {
	if (!to) {
		return { success: false, error: "Email required" };
	}
	const normalizedEmail = to.trim().toLowerCase();
	const code = Math.floor(100000 + Math.random() * 900000).toString();
	codes.delete(normalizedEmail);
	codes.set(normalizedEmail, code);
	try {
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
		return { success: false, error: "Error sending email" };
	}
}

export { codes };