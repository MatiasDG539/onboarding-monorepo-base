"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { FC } from "react";
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";

interface FormData {
  emailOrPhone: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  birthdate: string;
  profilePicture: File | null;
}

interface ValidationErrors {
  emailOrPhone?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  birthdate?: string;
}

const SignUpPage: FC = () => {
  const router = useRouter();
  const [useEmail, setUseEmail] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    emailOrPhone: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
    phoneNumber: "",
    birthdate: "",
    profilePicture: null,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Email validation regex
  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);
  
  // Phone validation regex (basic international format)
  const phoneRegex = useMemo(() => /^\+?[\d\s\-()]{10,15}$/, []);

  // Username validation (alphanumeric + underscore, 3-20 chars)
  const usernameRegex = useMemo(() => /^[a-zA-Z0-9_]{3,20}$/, []);

  const validateField = useCallback((name: string, value: string): string | undefined => {
    switch (name) {
      case "emailOrPhone":
        if (!value.trim()) return "This field is required";
        if (useEmail) {
          if (!emailRegex.test(value)) return "Enter a valid email";
        } else {
          if (!phoneRegex.test(value)) return "Enter a valid phone number";
        }
        break;
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return "Password must contain at least one uppercase, one lowercase, and one number";
        }
        break;
      case "confirmPassword":
        if (!value) return "Confirm your password";
        if (value !== formData.password) return "Passwords don't match";
        break;
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (value.trim().length < 2) return "First name must be at least 2 characters";
        break;
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (value.trim().length < 2) return "Last name must be at least 2 characters";
        break;
      case "username":
        if (!value.trim()) return "Username is required";
        if (!usernameRegex.test(value)) {
          return "Username must be 3-20 characters (letters, numbers, and _)";
        }
        break;
      case "phoneNumber":
        if (!value.trim()) return "Phone number is required";
        if (!phoneRegex.test(value)) return "Enter a valid phone number";
        break;
      case "birthdate": {
        if (!value) return "Birth date is required";
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 13) return "You must be at least 13 years old";
        if (age > 120) return "Enter a valid birth date";
        break;
      }
    }
    return undefined;
  }, [useEmail, emailRegex, phoneRegex, usernameRegex, formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, profilePicture: file }));
  };

  const validateCurrentStep = useCallback((): boolean => {
    if (currentStep === 1) {
      const emailOrPhoneError = validateField("emailOrPhone", formData.emailOrPhone);
      return !emailOrPhoneError;
    } else if (currentStep === 2) {
      const passwordError = validateField("password", formData.password);
      const confirmPasswordError = validateField("confirmPassword", formData.confirmPassword);
      return !passwordError && !confirmPasswordError;
    } else if (currentStep === 3) {
      const firstNameError = validateField("firstName", formData.firstName);
      const lastNameError = validateField("lastName", formData.lastName);
      const usernameError = validateField("username", formData.username);
      const phoneError = validateField("phoneNumber", formData.phoneNumber);
      const birthdateError = validateField("birthdate", formData.birthdate);
      
      return !firstNameError && !lastNameError && !usernameError && !phoneError && !birthdateError;
    }
    return false;
  }, [currentStep, formData, validateField]);

  useEffect(() => {
    setIsFormValid(validateCurrentStep());
  }, [formData, currentStep, validateCurrentStep]);

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        
        const emailToVerify = useEmail ? formData.emailOrPhone : formData.emailOrPhone;
        const encodedEmail = encodeURIComponent(emailToVerify);
        router.push(`/auth/verify/email?email=${encodedEmail}`);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Join TwitterClone</h2>
        <p className="text-gray-600">Let&apos;s start with your {useEmail ? "email" : "phone"}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="emailOrPhone" className="block text-sm font-medium text-gray-700 mb-2">
            {useEmail ? "Email" : "Phone Number"}
          </label>
          <input
            type={useEmail ? "email" : "tel"}
            id="emailOrPhone"
            name="emailOrPhone"
            value={formData.emailOrPhone}
            onChange={handleInputChange}
            placeholder={useEmail ? "your@email.com" : "+1 234 567 8900"}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-hidden focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500 ${
              errors.emailOrPhone
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-[#00AAEC]"
            }`}
          />
          {errors.emailOrPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.emailOrPhone}</p>
          )}
        </div>

        <Button
          appName="TwitterClone"
          className="text-[#00AAEC] hover:text-[#1DA1F2] font-medium transition-colors"
          onClick={() => {
            setUseEmail(!useEmail);
            setFormData(prev => ({ ...prev, emailOrPhone: "" }));
            setErrors(prev => ({ ...prev, emailOrPhone: undefined }));
          }}
        >
          {useEmail ? "Use phone instead" : "Use email instead"}
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Create your password</h2>
        <p className="text-gray-600">Make sure it&apos;s secure</p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Minimum 8 characters"
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-hidden focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500${
              errors.password
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-[#00AAEC]"
            }`}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Repeat your password"
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-hidden focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500${
              errors.confirmPassword
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-[#00AAEC]"
            }`}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
        <p className="text-gray-600">Complete your profile</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Your first name"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-hidden focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500${
                errors.firstName
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-[#00AAEC]"
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Your last name"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-hidden focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500${
                errors.lastName
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-[#00AAEC]"
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="@yourusername"
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-hidden focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500${
              errors.username
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-[#00AAEC]"
            }`}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="+1 234 567 8900"
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-hidden focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500${
              errors.phoneNumber
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-[#00AAEC]"
            }`}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
          )}
        </div>

        <div>
          <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-2">
            Birth Date
          </label>
          <input
            type="date"
            id="birthdate"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleInputChange}
            max={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500${
              errors.birthdate
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-[#00AAEC]"
            }`}
          />
          {errors.birthdate && (
            <p className="mt-1 text-sm text-red-600">{errors.birthdate}</p>
          )}
        </div>

        <div>
          <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-2">
            Profile Picture (optional)
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-[#00AAEC] to-[#1DA1F2] rounded-full flex items-center justify-center overflow-hidden">
              {formData.profilePicture ? (
                <Image
                  src={URL.createObjectURL(formData.profilePicture)}
                  alt="Preview"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xl">
                  {formData.firstName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#00AAEC] file:text-white hover:file:bg-[#1DA1F2] transition-colors"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/twitter_logo.svg"
              alt="Twitter Logo"
              width={48}
              height={48}
              className="w-12 h-12"
            />
          </div>
          
          {/* Progress Indicator */}
          <div className="flex justify-center space-x-2 mb-6">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-3 h-3 rounded-full transition-colors ${
                  step <= currentStep
                    ? "bg-[#00AAEC]"
                    : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}


          <div className="mt-8 space-y-4">
            <Button
              onClick={handleNext}
              disabled={!isFormValid}
              appName="TwitterClone"
              className={`w-full py-3 px-6 rounded-full font-bold text-lg transition-all duration-200 ${
                isFormValid
                  ? "bg-[#00AAEC] hover:bg-[#1DA1F2] text-white hover:scale-105 hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {currentStep === 3 ? "Create Account" : "Next"}
            </Button>

            {currentStep > 1 && (
              <Button
                onClick={handleBack}
                appName="TwitterClone"
                className="w-full py-3 px-6 rounded-full font-bold text-lg border-2 border-gray-300 text-gray-700 hover:border-[#00AAEC] hover:text-[#00AAEC] transition-colors"
              >
                Back
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}

            <a href="#" className="text-[#00AAEC] hover:text-[#1DA1F2] font-medium transition-colors">
              Sign in
            </a>

          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;