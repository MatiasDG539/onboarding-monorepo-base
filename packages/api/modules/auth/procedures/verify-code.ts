import { codes } from "../../email/procedures/send-email";

export function verifyCode(email: string, code: string): boolean {
	const normalizedEmail = email.trim().toLowerCase();
	const storedCode = codes.get(normalizedEmail);
	if (!storedCode) {
		return false;
	}
	const normalizedStored = String(storedCode).trim();
	const normalizedInput = String(code).trim();
	return normalizedStored === normalizedInput;
}