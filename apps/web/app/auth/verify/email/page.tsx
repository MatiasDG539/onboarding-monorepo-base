import React from "react";
import VerifyEmail from "../../../../components/verify-email";

interface EmailVerificationPageProps {
  searchParams: Promise<{ email?: string }>;
}

const EmailVerificationPage = async ({ searchParams }: EmailVerificationPageProps) => {
  const params = await searchParams;
  const email = params.email || "user@example.com";
  
  return <VerifyEmail email={email} />;
};

export default EmailVerificationPage;