import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { trpc } from '../../lib/trpc';
import { SignUpData } from '../../lib/forms/schemas';
import TextInputField from '../forms/text-input-field';

type Step1Props = {
  onEmailValidated?: (isValid: boolean) => void;
}

export const Step1 = ({ onEmailValidated }: Step1Props) => {
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  const { control, watch } = useFormContext<SignUpData>();
  const utils = trpc.useUtils();
  
  const emailOrPhone = watch('emailOrPhone');

  const checkEmailAvailability = useCallback(async (email: string): Promise<boolean> => {
    if (!email || !email.includes('@')) {
      setEmailError(null);
      onEmailValidated?.(false);
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError(null);
      onEmailValidated?.(false);
      return false;
    }
    
    setIsCheckingEmail(true);
    setEmailError(null);
    
    try {
      const result = await utils.auth.checkEmailExists.fetch({ email });
      
      if (result.exists) {
        setEmailError('This email is already in use. Please try another one.');
        onEmailValidated?.(false);
        return false;
      }
      
      onEmailValidated?.(true);
      return true;
    } catch {
      setEmailError('Error checking email. Please try again.');
      onEmailValidated?.(false);
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  }, [utils.auth.checkEmailExists, onEmailValidated]);

  useEffect(() => {
    setEmailError(null);
    onEmailValidated?.(false);
    
    if (emailOrPhone && emailOrPhone.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone)) {
      const delayedValidation = setTimeout(() => {
        checkEmailAvailability(emailOrPhone);
      }, 1000);
      
      return () => clearTimeout(delayedValidation);
    }
  }, [emailOrPhone, onEmailValidated, checkEmailAvailability]);

  return (
    <View className="items-center mb-8">
      <Text className="text-3xl font-bold text-gray-900 mb-2">Join TwitterClone</Text>
      <Text className="text-base text-gray-500 text-center mb-8">Let&apos;s start with your email</Text>

      <View className="w-full">
        <TextInputField
          control={control}
          name="emailOrPhone"
          placeholder="your@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus={true}
          style={{ fontSize: 16, color: '#1A202C' }}
          numberOfLines={1}
          textAlignVertical="center"
          allowFontScaling={true}
          onBlur={() => {
            const currentValue = watch('emailOrPhone');
            if (currentValue && currentValue.includes('@')) {
              checkEmailAvailability(currentValue);
            }
          }}
        />
        
        {isCheckingEmail && (
          <View className="flex-row items-center mb-2">
            <ActivityIndicator size="small" color="#00AAEC" className="mr-2" />
            <Text className="text-gray-500 text-xs">Checking email availability...</Text>
          </View>
        )}
        
        {emailError && (
          <Text className="text-red-500 text-xs mb-2">{emailError}</Text>
        )}
      </View>
    </View>
  );
};
