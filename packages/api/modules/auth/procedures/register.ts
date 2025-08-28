export interface UserData {
  emailOrPhone: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  birthdate: string;
  profilePicture?: File;
}

const users = new Map<string, UserData>();

export function registerUser(userData: UserData): { success: boolean; error?: string; user?: UserData } {
  if (users.has(userData.emailOrPhone) || users.has(userData.username)) {
    return { success: false, error: 'User already exists' };
  }

  users.set(userData.emailOrPhone, userData);
  users.set(userData.username, userData);

  return {
    success: true,
    user: userData
  };
}

export function getUser(identifier: string): UserData | undefined {
  return users.get(identifier);
}
