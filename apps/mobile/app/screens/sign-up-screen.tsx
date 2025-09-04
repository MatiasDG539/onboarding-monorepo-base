import React, { useState, useCallback } from 'react';
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
import Svg, { G, Path } from 'react-native-svg';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  SignUpSchema,
  SignUpStep1Schema,
  SignUpStep2Schema,
  SignUpStep3Schema,
  type SignUpData,
} from '@/components/forms/schemas';
import { trpc } from '../../lib/trpc';
import { useRouter, useNavigation } from 'expo-router';
import { Step1 } from '../../components/sign-up/step-1';
import { Step2 } from '../../components/sign-up/step-2';
import { Step3 } from '../../components/sign-up/step-3';

interface SignUpScreenProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onBack?: () => void;
}

const SignUpScreen = ({ currentStep, setCurrentStep, onBack }: SignUpScreenProps) => {
  const [useEmail, setUseEmail] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [emailValidated, setEmailValidated] = useState(false);

  const router = useRouter();
  const navigation = useNavigation();

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

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = formatDate(date);
    form.setValue("birthdate", formattedDate, { shouldValidate: true });
    setShowDatePicker(false);
  };

  React.useEffect(() => {
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
    const stepSchemas = [SignUpStep1Schema, SignUpStep2Schema, SignUpStep3Schema];
    const currentSchema = stepSchemas[currentStep - 1];
    
    if (!currentSchema) return { isValid: false, isSubmitting: false };
    
    try {
      const currentData = form.getValues();
      currentSchema.parse(currentData);
      return { isValid: true, isSubmitting: form.formState.isSubmitting };
    } catch {
      return { isValid: false, isSubmitting: form.formState.isSubmitting };
    }
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await form.trigger(['emailOrPhone']);
      if (isValid && emailValidated) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      const isValid = await form.trigger(['password', 'confirmPassword']);
      if (isValid) setCurrentStep(3);
    } else if (currentStep === 3) {
      const isValid = await form.trigger();
      if (isValid) {
        const userData = form.getValues();
        try {
          const result = await registerMutation.mutateAsync(userData);
          if (!result.success) {
            Alert.alert("Error", 'error' in result ? result.error : "Error creating user");
            return;
          }

          if (useEmail && 'user' in result && result.user) {
            const email = form.getValues("emailOrPhone");
            const sendResult = await sendEmailMutation.mutateAsync({ to: email });
            if (sendResult.success) {
              router.push(`/verify-email?email=${encodeURIComponent(email)}&userId=${result.user.id}`);
            } else {
              Alert.alert("Error", sendResult.error || "Error sending verification code");
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
          console.error('Registration error:', error);
          Alert.alert("Error", "Error creating user. Please try again.");
        }
      }
    }
  };

  const handleEmailValidation = useCallback((isValid: boolean) => {
    setEmailValidated(isValid);
  }, []);

  const renderStep1 = () => (
    <Step1 onEmailValidated={handleEmailValidation} />
  );

  const renderStep2 = () => (
    <Step2 />
  );

  const renderStep3 = () => (
    <Step3 
      showDatePicker={showDatePicker}
      setShowDatePicker={setShowDatePicker}
      selectedDate={selectedDate}
      onDateSelect={handleDateSelect}
    />
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
          <Svg width={72} height={72} viewBox="0 -4 48 48">
            <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
              <G transform="translate(-300, -164)" fill="#00AAEC">
                <Path d="M348,168.735283 C346.236309,169.538462 344.337383,170.081618 342.345483,170.324305 C344.379644,169.076201 345.940482,167.097147 346.675823,164.739617 C344.771263,165.895269 342.666667,166.736006 340.418384,167.18671 C338.626519,165.224991 336.065504,164 333.231203,164 C327.796443,164 323.387216,168.521488 323.387216,174.097508 C323.387216,174.88913 323.471738,175.657638 323.640782,176.397255 C315.456242,175.975442 308.201444,171.959552 303.341433,165.843265 C302.493397,167.339834 302.008804,169.076201 302.008804,170.925244 C302.008804,174.426869 303.747139,177.518238 306.389857,179.329722 C304.778306,179.280607 303.256911,178.821235 301.9271,178.070061 L301.9271,178.194294 C301.9271,183.08848 305.322064,187.17082 309.8299,188.095341 C309.004402,188.33225 308.133826,188.450704 307.235077,188.450704 C306.601162,188.450704 305.981335,188.390033 305.381229,188.271578 C306.634971,192.28169 310.269414,195.2026 314.580032,195.280607 C311.210424,197.99061 306.961789,199.605634 302.349709,199.605634 C301.555203,199.605634 300.769149,199.559408 300,199.466956 C304.358514,202.327194 309.53689,204 315.095615,204 C333.211481,204 343.114633,188.615385 343.114633,175.270495 C343.114633,174.831347 343.106181,174.392199 343.089276,173.961719 C345.013559,172.537378 346.684275,170.760563 348,168.735283" />
              </G>
            </G>
          </Svg>
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
              className={`py-4 px-8 rounded-full shadow-lg mt-4 ${
                currentStep === 1 
                  ? (currentFormState.isValid && emailValidated ? 'bg-[#00AAEC]' : 'bg-gray-300')
                  : (currentFormState.isValid ? 'bg-[#00AAEC]' : 'bg-gray-300')
                }`}
              onPress={handleNext}
              activeOpacity={0.9}
              disabled={
                currentStep === 1 
                  ? !currentFormState.isValid || !emailValidated
                  : !currentFormState.isValid || currentFormState.isSubmitting
              }
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
