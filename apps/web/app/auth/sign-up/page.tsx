
"use client";

import Image from "next/image";
import { useState } from "react";
import type { FC } from "react";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  SignUpStep1Schema, 
  SignUpStep2Schema, 
  SignUpStep3Schema
} from 'components/forms/schemas';
import type { SignUpStep1Data, SignUpStep2Data, SignUpStep3Data } from 'components/forms/schemas';

const SignUp: FC = () => {
  const [useEmail, setUseEmail] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  const emailOrPhoneForm = useForm<SignUpStep1Data>({
    resolver: zodResolver(SignUpStep1Schema),
    mode: 'onChange',
    defaultValues: {
      emailOrPhone: "",
    }
  });

  const passwordForm = useForm<SignUpStep2Data>({
    resolver: zodResolver(SignUpStep2Schema),
    mode: 'onChange',
    defaultValues: {
      password: "",
      confirmPassword: "",
    }
  });

  const profileForm = useForm<SignUpStep3Data>({
    resolver: zodResolver(SignUpStep3Schema),
    mode: 'onChange',
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      phoneNumber: "",
      birthdate: "",
      profilePicture: null,
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      profileForm.setValue('profilePicture', file);
    }
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      return emailOrPhoneForm.formState.isValid;
    } else if (currentStep === 2) {
      return passwordForm.formState.isValid;
    } else if (currentStep === 3) {
      return profileForm.formState.isValid;
    }
    return false;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await emailOrPhoneForm.trigger();
      if (isValid) {
      setCurrentStep(currentStep + 1);
      }
    } else if (currentStep === 2) {
      const isValid = await passwordForm.trigger();
      if (isValid) {
      setCurrentStep(currentStep + 1);
      }
    } else if (currentStep === 3) {
      const isValid = await profileForm.trigger();
      if (isValid) {
      // Final step, handle account creation
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
            {useEmail ? "Email" : "Phone number"}
          </label>
          <input
            type={useEmail ? "email" : "tel"}
            id="emailOrPhone"
            placeholder={useEmail ? "tu@email.com" : "+1 234 567 8900"}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-hidden focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500 ${
              emailOrPhoneForm.formState.errors.emailOrPhone
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-[#00AAEC]"
            }`}
            {...emailOrPhoneForm.register("emailOrPhone")}
          />
          {emailOrPhoneForm.formState.errors.emailOrPhone && (
            <p className="mt-1 text-sm text-red-600">
              {emailOrPhoneForm.formState.errors.emailOrPhone.message}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setUseEmail(!useEmail);
            emailOrPhoneForm.setValue("emailOrPhone", "");
            emailOrPhoneForm.clearErrors("emailOrPhone");
          }}
          className="text-[#00AAEC] hover:text-[#1DA1F2] font-medium transition-colors"
        >
          {useEmail ? "Use phone instead" : "Use email instead"}
        </button>
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
            placeholder="Minimum 8 characters"
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-hidden focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500${
              passwordForm.formState.errors.password
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-[#00AAEC]"
            }`}
            {...passwordForm.register("password")}
          />
          {passwordForm.formState.errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {passwordForm.formState.errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm password
          </label>

          <input
            type="password"
            id="confirmPassword"
            placeholder="Repeat your password"
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-hidden focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500${
              passwordForm.formState.errors.confirmPassword
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-[#00AAEC]"
            }`}
            {...passwordForm.register("confirmPassword")}
          />
          {passwordForm.formState.errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">
              {passwordForm.formState.errors.confirmPassword.message}
            </p>
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
              First name
            </label>

            <input
              type="text"
              id="firstName"
              placeholder="Your first name"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-hidden focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500${
                profileForm.formState.errors.firstName
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-[#00AAEC]"
              }`}
              {...profileForm.register("firstName")}
            />
            {profileForm.formState.errors.firstName && (
              <p className="mt-1 text-sm text-red-600">
                {profileForm.formState.errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last name
            </label>

            <input
              type="text"
              id="lastName"
              placeholder="Your last name"
              className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-hidden focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500${
                profileForm.formState.errors.lastName
                  ? "border-red-300 focus:border-red-500"
                  : "border-gray-200 focus:border-[#00AAEC]"
              }`}
              {...profileForm.register("lastName")}
            />
            {profileForm.formState.errors.lastName && (
              <p className="mt-1 text-sm text-red-600">
                {profileForm.formState.errors.lastName.message}
              </p>
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
            placeholder="@yourusername"
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-hidden focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500${
              profileForm.formState.errors.username
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-[#00AAEC]"
            }`}
            {...profileForm.register("username")}
          />
          {profileForm.formState.errors.username && (
            <p className="mt-1 text-sm text-red-600">
              {profileForm.formState.errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Phone number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            placeholder="+1 234 567 8900"
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-hidden focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500${
              profileForm.formState.errors.phoneNumber
                ? "border-red-300 focus:border-red-500"
                : "border-gray-200 focus:border-[#00AAEC]"
            }`}
            {...profileForm.register("phoneNumber")}
          />
          {profileForm.formState.errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">
              {profileForm.formState.errors.phoneNumber.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-2">
            Birthdate
          </label>

          <Controller
            control={profileForm.control}
            name="birthdate"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <>
                <input
                  type="date"
                  id="birthdate"
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-0 bg-white text-gray-900 placeholder:text-gray-500${
                    error
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-[#00AAEC]"
                  }`}
                />
                {error && (
                  <p className="mt-1 text-sm text-red-600">{error.message}</p>
                )}
              </>
            )}
          />
        </div>

        <div>
          <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-2">
            Profile picture (optional)
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-[#00AAEC] to-[#1DA1F2] rounded-full flex items-center justify-center overflow-hidden">
              {profileForm.watch("profilePicture") ? (
                <Image
                  src={URL.createObjectURL(profileForm.watch("profilePicture"))}
                  alt="Preview"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xl">
                  {profileForm.watch("firstName")?.charAt(0).toUpperCase() || "?"}
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

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="mt-8 space-y-4">
            <button
              onClick={handleNext}
              disabled={!validateCurrentStep()}
              className={`w-full py-3 px-6 rounded-full font-bold text-lg transition-all duration-200 ${
                validateCurrentStep()
                  ? "bg-[#00AAEC] hover:bg-[#1DA1F2] text-white hover:scale-105 hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {currentStep === 3 ? "Create account" : "Next"}
            </button>

            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="w-full py-3 px-6 rounded-full font-bold text-lg border-2 border-gray-300 text-gray-700 hover:border-[#00AAEC] hover:text-[#00AAEC] transition-colors"
              >
                Back
              </button>
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
}

export default SignUp;
