import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import TwitterIcon from '@/components/icons/twitter-icon';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  SignUpSchema,
  type SignUpData,
} from '@/lib/forms/schemas';
import { useNavigation, useRouter } from 'expo-router';
import { Step1 } from '../../components/sign-up/step-1';
import { Step2 } from '../../components/sign-up/step-2';
import { Step3 } from '../../components/sign-up/step-3';

type SignUpScreenProps = {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onBack?: () => void;
}

const SignUpScreen = ({ currentStep, setCurrentStep, onBack }: SignUpScreenProps) => {
  const [useEmail, setUseEmail] = useState(true);

  const navigation = useNavigation();
  const router = useRouter();

  const form = useForm<SignUpData>({
    resolver: zodResolver(SignUpSchema),
    mode: 'onChange',
    defaultValues: {
      emailOrPhone: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      username: "",
      phoneNumber: "",
      birthdate: "",
      profilePicture: null,
    }
  });

  useEffect(() => {
    if (currentStep > 1) {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity onPress={onBack}>
            <Text className="text-[#00AAEC] text-base">Back</Text>
          </TouchableOpacity>
        ),
        headerBackTitle: 'Back',
      });
    } else {
      navigation.setOptions({ headerLeft: undefined, headerBackVisible: true, headerBackTitle: 'Back' });
    }
  }, [navigation, currentStep, onBack]);

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep1 = () => (
    <Step1 onNext={handleNext} />
  );

  const renderStep2 = () => (
    <Step2 onNext={handleNext} />
  );

  const renderStep3 = () => (
    <Step3 
      useEmail={useEmail} 
      setUseEmail={setUseEmail} 
      onBack={handleBack}
    />
  );

  return (
    <FormProvider {...form}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-gradient-to-b from-slate-50 to-white"
        style={{ paddingTop: 72 }}
      >

        <View className="items-center mb-6">
          <TwitterIcon width={72} height={72} />
        </View>

        {/* Progress indicator */}
        <View className="flex-row justify-center gap-3 mb-8">
          {[1, 2, 3].map((step) => (
            <View
              key={step}
              className={`w-3 h-3 rounded-full ${step <= currentStep ? 'bg-[#00AAEC]' : 'bg-gray-300'
                }`}
            />
          ))}
        </View>

        <ScrollView
          className="flex-1 px-8"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        >
          <View className="w-full max-w-sm mx-auto">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="pb-8 px-8">
          <TouchableOpacity
            onPress={() => router.push('/sign-in')}
            activeOpacity={0.8}
          >
            <Text className="text-gray-500 text-base text-center">
              Already have an account?{' '}
              <Text className="text-[#00AAEC] font-semibold">Sign In</Text>
            </Text>
          </TouchableOpacity>

          <View className="mt-4">
            <Text className="text-center text-gray-400 text-sm">
              © 2025 TwitterClone.
            </Text>
          </View>
        </View>

      </KeyboardAvoidingView>
    </FormProvider>
  );
};

export default SignUpScreen;
