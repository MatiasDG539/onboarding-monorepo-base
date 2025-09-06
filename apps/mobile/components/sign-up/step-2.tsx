import React from 'react';
import { View, Text } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { SignUpData } from '../../lib/forms/schemas';
import TextInputField from '../forms/text-input-field';

export const Step2 = () => {
  const { control, formState: { errors } } = useFormContext<SignUpData>();

  return (
    <View className="items-center mb-8">
      <Text className="text-3xl font-bold text-gray-900 mb-2">Create your password</Text>
      <Text className="text-base text-gray-500 text-center mb-8">Make sure it&apos;s secure</Text>

      <View className="w-full">
        <TextInputField
          control={control}
          name="password"
          placeholder="Minimum 8 characters"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.password}
        />

        <TextInputField
          control={control}
          name="confirmPassword"
          placeholder="Repeat your password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.confirmPassword}
        />
      </View>
    </View>
  );
};
