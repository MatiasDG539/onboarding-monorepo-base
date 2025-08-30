"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import type { FC } from "react";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";
import { trpc } from "../lib/trpc";

interface VerifyEmailProps {
  email?: string;
}

const VerifyEmail: FC<VerifyEmailProps> = ({ email = "user@example.com" }) => {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const verifyMutation = trpc.auth.verifyCode.useMutation();
  const resendMutation = trpc.email.sendActivationEmail.useMutation();

  const isEmail = email.includes("@");

  const maskedContact = isEmail
    ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : email.replace(/(\+?\d{1,3})(\d{3,})(\d{4})/, "$1***$3");

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  useEffect(() => {
    const isCompleteCode = code.every(digit => digit !== "");
    setIsComplete(isCompleteCode);
    if (isCompleteCode) {
      setError("");
    }
  }, [code]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    const digits = pastedData.slice(0, 6).split("");

    const newCode = [...code];
    digits.forEach((digit, index) => {
      if (index < 6) newCode[index] = digit;
    });
    setCode(newCode);

    const nextEmptyIndex = newCode.findIndex(digit => digit === "");
    const focusIndex = nextEmptyIndex === -1 ? 5 : Math.min(nextEmptyIndex, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setError("");

    try {
      const enteredCode = code.join("");
      const result = await verifyMutation.mutateAsync({
        email,
        code: enteredCode,
      });
      if (!result.valid) {
        setError("Código inválido. Intenta nuevamente.");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        return;
      }
      router.push("/dashboard");
    } catch (error) {
      console.error("Error verifying code:", error);
      setError(error instanceof Error ? error.message : "Error verificando el código.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code
  const handleResend = async () => {
    if (!canResend) return;

    try {
      await resendMutation.mutateAsync({ to: email });
      setCanResend(false);
      setResendTimer(60);
      setError("");
    } catch (error) {
      console.error("Error resending code:", error);
      setError(error instanceof Error ? error.message : "Failed to resend code. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/twitter_logo.svg"
              alt="Twitter Logo"
              width={48}
              height={48}
              className="w-12 h-12"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              We sent you a code
            </h1>
            <p className="text-gray-600">
              Enter the 6-digit code we sent to your {isEmail ? "email" : "phone"}
            </p>
            <p className="text-[#00AAEC] font-semibold">
              {maskedContact}
            </p>
          </div>

          {/* Code Input */}
          <div className="space-y-6">
            <div className="flex justify-center space-x-3">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg transition-colors focus:outline-none focus:ring-0 text-black placeholder-gray-400 ${error
                      ? "border-red-300 focus:border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-[#00AAEC] bg-white"
                    }`}
                  placeholder="0"
                />
              ))}
            </div>

            {error && (
              <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-center space-x-2">
                  <svg 
                    className="w-5 h-5 text-red-500 flex-shrink-0" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">
                Didn&apos;t receive the {isEmail ? "email" : "SMS"}?
              </p>
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-[#00AAEC] hover:text-[#1DA1F2] font-medium transition-colors"
                >
                  Resend code
                </button>
              ) : (
                <p className="text-gray-400 text-sm">
                  Resend in {resendTimer}s
                </p>
              )}
            </div>

            <Button
              onClick={handleVerify}
              disabled={!isComplete || isLoading}
              appName="TwitterClone"
              className={`w-full py-3 px-6 rounded-full font-bold text-lg transition-all duration-200 ${isComplete && !isLoading
                  ? "bg-[#00AAEC] hover:bg-[#1DA1F2] text-white hover:scale-105 hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              {isLoading ? "Verifying..." : "Next"}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Having trouble verifying?{" "}
            <button
              onClick={() => router.back()}
              className="text-[#00AAEC] hover:text-[#1DA1F2] font-medium transition-colors"
            >
              Go back
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
