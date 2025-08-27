export type FormStepData = Record<string, any>;

export const combineFormData = <T extends Record<string, any>>(
  ...formDataObjects: Partial<T>[]
): T => {
  return formDataObjects.reduce((acc, curr) => ({ ...acc, ...curr }), {}) as T;
};

export const FORM_UTILS_MESSAGES = {
  GENERIC_ERROR: "An error occurred",
  LOADING: "Loading...",
  SUCCESS: "Operation successful",
  NETWORK_ERROR: "Connection error",
  VALIDATION_ERROR: "Please check the entered data",
} as const;

export const detectInputType = (value: string): 'email' | 'phone' => {
  return value.indexOf('@') !== -1 ? 'email' : 'phone';
};

export const formatName = (name: string): string => {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};

export const calculateAge = (birthdate: string): number => {
  const birthDate = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};
