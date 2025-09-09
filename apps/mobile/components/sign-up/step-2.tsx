import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { SignUpData, stepSchemas } from '../../lib/forms/schemas';
import TextInputField from '../forms/text-input-field';

type Step2Props = {
  onNext: () => void;
};

export const Step2 = ({ onNext }: Step2Props) => {
  const { control, formState: { errors }, trigger, getValues } = useFormContext<SignUpData>();

  const handleNext = async () => {
    const isValid = await trigger(['password', 'confirmPassword']);
    if (isValid) {
      onNext();
    }
  };

  const isStepValid = () => {
    const currentData = {
      password: getValues('password'),
      confirmPassword: getValues('confirmPassword')
    };
    try {
      stepSchemas.step2.parse(currentData);
      return true;
    } catch {
      return false;
    }
  };

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
