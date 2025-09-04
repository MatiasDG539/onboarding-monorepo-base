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

// Sign-in schema
export const SignInSchema = z.object({
  emailOrPhone: z.string()
    .min(1, ERROR_MESSAGES.REQUIRED)
    .refine((value) => {
      if (value.indexOf('@') !== -1) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      } else {
        return /^\+?[\d\s\-()]{10,15}$/.test(value);
      }
    }, ERROR_MESSAGES.EMAIL_INVALID),
  password: z.string()
    .min(8, ERROR_MESSAGES.PASSWORD_TOO_SHORT),
});

export type SignInData = z.infer<typeof SignInSchema>;

// Sign-up schema
export const SignUpSchema = z.object({
  emailOrPhone: z.string()
    .min(1, ERROR_MESSAGES.REQUIRED)
    .refine((value) => {
      if (value.indexOf('@') !== -1) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      } else {
        return /^\+?[\d\s\-()]{10,15}$/.test(value);
      }
    }, "Please enter a valid email or phone number"),
  password: z.string()
    .min(8, ERROR_MESSAGES.PASSWORD_TOO_SHORT)
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, ERROR_MESSAGES.PASSWORD_WEAK),
  confirmPassword: z.string().min(1, "Please confirm your password"),
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
}).refine((data) => data.password === data.confirmPassword, {
  message: ERROR_MESSAGES.PASSWORDS_DONT_MATCH,
  path: ["confirmPassword"],
});

// Step schemas derived from main schema
export const SignUpStep1Schema = SignUpSchema.pick({ emailOrPhone: true });
export const SignUpStep2Schema = SignUpSchema.pick({ password: true, confirmPassword: true }).refine((data) => data.password === data.confirmPassword, {
  message: ERROR_MESSAGES.PASSWORDS_DONT_MATCH,
  path: ["confirmPassword"],
});
export const SignUpStep3Schema = SignUpSchema.pick({ 
  firstName: true, 
  lastName: true, 
  username: true, 
  phoneNumber: true, 
  birthdate: true, 
  profilePicture: true 
});

export type SignUpData = z.infer<typeof SignUpSchema>;
export type SignUpStep1Data = z.infer<typeof SignUpStep1Schema>;
export type SignUpStep2Data = z.infer<typeof SignUpStep2Schema>;
export type SignUpStep3Data = z.infer<typeof SignUpStep3Schema>;
