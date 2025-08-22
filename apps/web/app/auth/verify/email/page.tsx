import React from "react";
import VerifyEmail from "../../../../components/verify-email";

interface EmailVerificationPageProps {
  searchParams: { email?: string };
}

const EmailVerificationPage = ({ searchParams }: EmailVerificationPageProps) => {
  const email = searchParams.email || "user@example.com";
  
  return <VerifyEmail email={email} />;
};

export default EmailVerificationPage;