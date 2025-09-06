import React from 'react';
import { View, Text } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { SignUpData } from '../../lib/forms/schemas';
import TextInputField from '../forms/text-input-field';

export const Step1 = () => {
  const { control, formState: { errors } } = useFormContext<SignUpData>();

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
    </View>
  );
};
