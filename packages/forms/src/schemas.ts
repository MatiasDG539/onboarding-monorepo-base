import { z } from 'zod';

export const ERROR_MESSAGES = {
  REQUIRED: "This field is required",
  EMAIL_INVALID: "Please enter a valid email",
  PHONE_INVALID: "Please enter a valid phone number",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
  PASSWORD_WEAK: "Password must contain at least one uppercase, one lowercase and one number",
  PASSWORDS_DONT_MATCH: "Passwords do not match",
  USERNAME_INVALID: "Username must be 3-20 characters (letters, numbers and _)",
  AGE_TOO_YOUNG: "You must be at least 13 years old",
  NAME_TOO_SHORT: (field: string) => `${field} must be at least 2 characters`,
} as const;

export const SignUpStep1Schema = z.object({
  emailOrPhone: z.string()
    .min(1, ERROR_MESSAGES.REQUIRED)
    .refine((value) => {
      if (value.indexOf('@') !== -1) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      } else {
        return /^\+?[\d\s\-()]{10,15}$/.test(value);
      }
    }, "Please enter a valid email or phone number"),
});

export const SignUpStep2Schema = z.object({
  password: z.string()
    .min(8, ERROR_MESSAGES.PASSWORD_TOO_SHORT)
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, ERROR_MESSAGES.PASSWORD_WEAK),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: ERROR_MESSAGES.PASSWORDS_DONT_MATCH,
  path: ["confirmPassword"],
});

export const SignUpStep3Schema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .min(2, ERROR_MESSAGES.NAME_TOO_SHORT("First name")),
  lastName: z.string()
    .min(1, "Last name is required")
    .min(2, ERROR_MESSAGES.NAME_TOO_SHORT("Last name")),
  username: z.string()
    .min(1, "Username is required")
    .regex(/^[a-zA-Z0-9_]{3,20}$/, ERROR_MESSAGES.USERNAME_INVALID),
  phoneNumber: z.string()
    .min(1, "Phone number is required")
    .regex(/^\+?[\d\s\-()]{10,15}$/, ERROR_MESSAGES.PHONE_INVALID),
  birthdate: z.string()
    .min(1, "Birth date is required")
    .refine((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= 13 && age <= 120;
    }, ERROR_MESSAGES.AGE_TOO_YOUNG),
  profilePicture: z.any().nullable().optional(),
});

export type SignUpStep1Data = z.infer<typeof SignUpStep1Schema>;
export type SignUpStep2Data = z.infer<typeof SignUpStep2Schema>;
export type SignUpStep3Data = z.infer<typeof SignUpStep3Schema>;

export type CompleteSignUpData = SignUpStep1Data & SignUpStep2Data & SignUpStep3Data;
