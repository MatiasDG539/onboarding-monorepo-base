import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  SignUpStep1Schema,
  SignUpStep2Schema,
  SignUpStep3Schema,
  SignUpStep1Data,
  SignUpStep2Data,
  SignUpStep3Data,
} from './schemas';

export function useSignUpStep1Form() {
  return useForm<SignUpStep1Data>({
    resolver: zodResolver(SignUpStep1Schema),
    mode: 'onChange',
    defaultValues: { emailOrPhone: '' }
  });
}

export function useSignUpStep2Form() {
  return useForm<SignUpStep2Data>({
    resolver: zodResolver(SignUpStep2Schema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' }
  });
}

export function useSignUpStep3Form() {
  return useForm<SignUpStep3Data>({
    resolver: zodResolver(SignUpStep3Schema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      phoneNumber: '',
      birthdate: '',
      profilePicture: null
    }
  });
}
