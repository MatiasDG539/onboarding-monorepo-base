import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';
import { SignUpData } from '../forms/schemas';

export const Step2: React.FC = () => {
  const { control, formState } = useFormContext<SignUpData>();

  return (
    <View className="items-center mb-8">
      <Text className="text-3xl font-bold text-gray-900 mb-2">Create your password</Text>
      <Text className="text-base text-gray-500 text-center mb-8">Make sure it&apos;s secure</Text>

      <View className="w-full">
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base text-gray-900"
              placeholder="Minimum 8 characters"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onChange}
              value={value}
              placeholderTextColor="#A0AEC0"
            />
          )}
        />
        {formState.errors.password && (
          <Text className="text-red-500 text-xs mb-2">{formState.errors.password.message}</Text>
        )}

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base text-gray-900"
              placeholder="Repeat your password"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onChange}
              value={value}
              placeholderTextColor="#A0AEC0"
            />
          )}
        />
        {formState.errors.confirmPassword && (
          <Text className="text-red-500 text-xs mb-2">{formState.errors.confirmPassword.message}</Text>
        )}
      </View>
    </View>
  );
};
