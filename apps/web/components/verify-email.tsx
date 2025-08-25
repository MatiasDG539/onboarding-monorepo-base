"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import type { FC } from "react";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";

interface VerifyEmailProps {
  email?: string;
}

const VerifyEmail: FC<VerifyEmailProps> = ({ email = "user@example.com" }) => {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
      console.log("Sending verification request:", { email, code: enteredCode });

      const res = await fetch("/api/verifyCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: enteredCode }),
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        const errorText = await res.text();
        console.error("HTTP error response:", errorText);
        throw new Error(`HTTP error! status: ${res.status}, response: ${errorText}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await res.text();
        console.error("Non-JSON response:", responseText);
        throw new Error(`Expected JSON response, got: ${contentType}`);
      }

      const data = await res.json();
      console.log("Response data:", data);

      if (data.success) {
        router.push("/dashboard");
      } else {
        setError(data.error || "Incorrect code. Please try again.");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error("Error verifying code:", err);
      setError(err instanceof Error ? err.message : "Error verifying code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend code
  const handleResend = async () => {
    if (!canResend) return;

    try {
      const res = await fetch("/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      if (data.success) {
        setCanResend(false);
        setResendTimer(60); // 60 seconds timer
        // Optional: show success message
        setError("");
      } else {
        setError("Failed to resend code. Please try again.");
      }
    } catch (err) {
      console.error("Error resending code:", err);
      setError("Error resending code. Please try again.");
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
              <div className="text-center">
                <p className="text-red-600 text-sm font-medium">{error}</p>
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
