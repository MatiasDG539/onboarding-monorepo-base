import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import TwitterIcon from '@/components/ui/TwitterIcon';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  SignUpSchema,
  stepSchemas,
  type SignUpData,
} from '@/lib/forms/schemas';
import { trpc } from '../../lib/trpc';
import { useRouter, useNavigation } from 'expo-router';
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

  const router = useRouter();
  const navigation = useNavigation();
  const utils = trpc.useUtils();

  const sendEmailMutation = trpc.email.sendActivationEmail.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

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

  const getCurrentFormState = () => {
    const currentStepSchemas = [stepSchemas.step1, stepSchemas.step2, stepSchemas.step3];
    const currentSchema = currentStepSchemas[currentStep - 1];

    if (!currentSchema) {
      return { isValid: false, isSubmitting: form.formState.isSubmitting };
    }

    try {
      const allData = form.getValues();

      const currentData = currentSchema.shape ?
        Object.keys(currentSchema.shape).reduce((acc, key) => {
          acc[key] = allData[key as keyof SignUpData];
          return acc;
        }, {} as any) : allData;

      currentSchema.parse(currentData);
      return { isValid: true, isSubmitting: form.formState.isSubmitting };
    } catch {
      return { isValid: false, isSubmitting: form.formState.isSubmitting };
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const isValidFormat = await form.trigger(['emailOrPhone']);
      if (isValidFormat) {
        const emailValue = form.getValues('emailOrPhone');

        if (emailValue && emailValue.includes('@')) {
          try {
            const result = await utils.auth.checkEmailExists.fetch({ email: emailValue });
            if (result.exists) {
              form.setError('emailOrPhone', {
                type: 'manual',
                message: 'This email is already in use. Please try another one.'
              });
              return;
            }
          } catch {
            form.setError('emailOrPhone', {
              type: 'manual',
              message: 'Error checking email availability. Please try again.'
            });
            return;
          }
        }

        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      const isValid = await form.trigger(['password', 'confirmPassword']);
      if (isValid) setCurrentStep(3);
    } else if (currentStep === 3) {
      const isValid = await form.trigger(['firstName', 'lastName', 'username', 'phoneNumber', 'birthdate']);

      if (isValid) {
        const userData = form.getValues();
        try {
          const result = await registerMutation.mutateAsync(userData);

          if (useEmail && result.user) {
            const email = form.getValues("emailOrPhone");
            try {
              await sendEmailMutation.mutateAsync({ to: email });
              router.push(`/verify-email?email=${encodeURIComponent(email)}&userId=${result.user.id}`);
            } catch (emailError) {
              Alert.alert("Error", emailError instanceof Error ? emailError.message : "Error sending verification code");
            }
          } else {
            Alert.alert(
              "Phone verification not available",
              "Phone verification is not implemented yet. Please use email instead.",
              [
                {
                  text: "Use Email",
                  onPress: () => {
                    setUseEmail(true);
                    setCurrentStep(1);
                    form.setValue("emailOrPhone", "");
                  }
                }
              ]
            );
          }
        } catch (error) {
          Alert.alert("Error", error instanceof Error ? error.message : "An unexpected error occurred. Please try again.");
        }
      }
    }
  };

  const renderStep1 = () => (
    <Step1 />
  );

  const renderStep2 = () => (
    <Step2 />
  );

  const renderStep3 = () => (
    <Step3 />
  );

  const currentFormState = getCurrentFormState();

  return (
    <FormProvider {...form}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-gradient-to-b from-slate-50 to-white"
      >
        <View className="h-14" />
        <View style={{ height: 16 }} />

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

            <TouchableOpacity
              className={`py-4 px-8 rounded-full shadow-lg mt-4 ${currentFormState.isValid ? 'bg-[#00AAEC]' : 'bg-gray-300'
                }`}
              onPress={handleNext}
              activeOpacity={0.9}
              disabled={!currentFormState.isValid || currentFormState.isSubmitting}
            >
              {currentFormState.isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg text-center">
                  {currentStep === 3 ? "Create Account" : "Next"}
                </Text>
              )}
            </TouchableOpacity>
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
