import { NextResponse } from "next/server";
import { render } from "@react-email/render";
import { createTransporter, ActivationEmail } from "../../../email";

const codes = new Map<string, string>();

export async function POST(req: Request) {
  try {
    const { to } = await req.json();

    if (!to) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    codes.delete(to);
    codes.set(to, code);
    

    const transporter = createTransporter();
    const html = render(<ActivationEmail code={code} />);

    await transporter.sendMail({
      from: process.env.SMTP_FROM || "gutierrezmatiasdaniel539@gmail.com",
      to,
      subject: "Activation code",
      html,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in sendEmail endpoint:", err);
    return NextResponse.json({ error: "Error sending email" }, { status: 500 });
  }
}

export function verifyCode(email: string, code: string): boolean {
  const storedCode = codes.get(email);
  
  if (!storedCode) {
    return false;
  }
  
  const normalizedStored = String(storedCode).trim();
  const normalizedInput = String(code).trim();
  
  const result = normalizedStored === normalizedInput;
  
  return result;
}
