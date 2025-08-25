import { NextResponse } from "next/server";
import { verifyCode } from "../sendEmail/route";

export async function POST(req: Request) {
  try {
    console.log("VerifyCode endpoint called");
    
    const body = await req.json();
    console.log("Request body:", body);
    
    const { email, code } = body;

    if (!email || !code) {
      console.log("Missing parameters:", { email: !!email, code: !!code });
      return NextResponse.json({ error: "Parámetros faltantes" }, { status: 400 });
    }

    console.log("Verifying code for email:", email, "with code:", code);
    const isValid = verifyCode(email, code);
    console.log("Verification result:", isValid);

    if (isValid) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Código inválido" }, { status: 400 });
  } catch (error) {
    console.error("Error in verifyCode endpoint:", error);
    return NextResponse.json({ error: "Error verificando código" }, { status: 500 });
  }
}
