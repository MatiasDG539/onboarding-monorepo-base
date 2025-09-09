import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { SignUpData, stepSchemas } from '../../lib/forms/schemas';
import TextInputField from '../forms/text-input-field';
import { trpc } from '../../lib/trpc';

type Step1Props = {
  onNext: () => void;
};

export const Step1 = ({ onNext }: Step1Props) => {
  const { control, formState: { errors }, trigger, getValues, setError } = useFormContext<SignUpData>();
  const utils = trpc.useUtils();

  const handleNext = async () => {
    const isValidFormat = await trigger(['emailOrPhone']);
    if (isValidFormat) {
      const emailValue = getValues('emailOrPhone');

      if (emailValue && emailValue.includes('@')) {
        try {
          const result = await utils.auth.checkEmailExists.fetch({ email: emailValue });
          if (result.exists) {
            setError('emailOrPhone', {
              type: 'manual',
              message: 'This email is already in use. Please try another one.'
            });
            return;
          }
        } catch {
          setError('emailOrPhone', {
            type: 'manual',
            message: 'Error checking email availability. Please try again.'
          });
          return;
        }
      }

      onNext();
    }
  };

  const isStepValid = () => {
    const currentData = { emailOrPhone: getValues('emailOrPhone') };
    try {
      stepSchemas.step1.parse(currentData);
      return true;
    } catch {
      return false;
    }
  };

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
          autoFocus
          error={errors.emailOrPhone}
        />
      </View>

      <TouchableOpacity
        className={`py-4 px-8 rounded-full shadow-lg mt-4 w-full ${isStepValid() ? 'bg-[#00AAEC]' : 'bg-gray-300'}`}
        onPress={handleNext}
        activeOpacity={0.9}
        disabled={!isStepValid()}
      >
        <Text className="text-white font-bold text-lg text-center">
          Next
        </Text>
      </TouchableOpacity>
    </View>
  );
};
