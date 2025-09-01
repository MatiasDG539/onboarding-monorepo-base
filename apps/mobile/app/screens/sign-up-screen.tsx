import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Svg, { G, Path } from 'react-native-svg';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  SignUpStep1Schema,
  SignUpStep2Schema,
  SignUpStep3Schema,
  type SignUpStep1Data,
  type SignUpStep2Data,
  type SignUpStep3Data,
} from '@/components/forms/schemas';
import { trpc } from '../../lib/trpc';
import { useRouter, useNavigation } from 'expo-router';

interface SignUpScreenProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onBack?: () => void;
}

const SignUpScreen = ({ currentStep, setCurrentStep, onBack }: SignUpScreenProps) => {
  const [useEmail, setUseEmail] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const router = useRouter();
  const navigation = useNavigation();

  const sendEmailMutation = trpc.email.sendActivationEmail.useMutation();
  const registerMutation = trpc.auth.register.useMutation();

  const emailOrPhoneForm = useForm<SignUpStep1Data>({
    resolver: zodResolver(SignUpStep1Schema),
    mode: 'onChange',
    defaultValues: { emailOrPhone: "" }
  });

  const passwordForm = useForm<SignUpStep2Data>({
    resolver: zodResolver(SignUpStep2Schema),
    mode: 'onChange',
    defaultValues: { password: "", confirmPassword: "" }
  });

  const profileForm = useForm<SignUpStep3Data>({
    resolver: zodResolver(SignUpStep3Schema),
    mode: 'onChange',
    defaultValues: {
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

  const formatDateForDisplay = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    const formattedDate = formatDate(date);
    profileForm.setValue("birthdate", formattedDate, { shouldValidate: true });
    setShowDatePicker(false);
  };

  const DatePickerModal = () => {
    const [tempDate, setTempDate] = useState(selectedDate || new Date(2000, 0, 1));
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - 13 - i);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const getDaysInMonth = (year: number, month: number) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const days = Array.from({ length: getDaysInMonth(tempDate.getFullYear(), tempDate.getMonth()) }, (_, i) => i + 1);

    const WheelPicker = ({
      data,
      selectedValue,
      onValueChange,
      itemHeight = 50
    }: {
      data: (string | number)[],
      selectedValue: string | number,
      onValueChange: (value: string | number) => void,
      itemHeight?: number
    }) => {
      const scrollViewRef = React.useRef<ScrollView>(null);
      const [initialized, setInitialized] = React.useState(false);

      React.useEffect(() => {
        if (scrollViewRef.current && !initialized) {
          const selectedIndex = data.findIndex(item => item === selectedValue);
          if (selectedIndex !== -1) {
            setTimeout(() => {
              scrollViewRef.current?.scrollTo({
                y: selectedIndex * itemHeight,
                animated: false,
              });
              setInitialized(true);
            }, 100);
          }
        }
      }, [data, selectedValue, itemHeight, initialized]);

      const handleScroll = (event: any) => {
        const y = event.nativeEvent.contentOffset.y;
        const index = Math.round(y / itemHeight);
        const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
        if (data[clampedIndex] !== selectedValue) {
          onValueChange(data[clampedIndex]);
        }
      };

      return (
        <View className="flex-1" style={{ height: itemHeight * 5, position: 'relative' }}>
          <View
            className="absolute left-0 right-0 z-10"
            style={{
              top: itemHeight * 2,
              height: itemHeight,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: '#00AAEC',
              backgroundColor: 'transparent',
              shadowColor: '#00AAEC',
              shadowOpacity: 0.08,
              shadowRadius: 4,
              shadowOffset: { width: 0, height: 2 },
            }}
            pointerEvents="none"
          />
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={itemHeight}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScroll}
            contentContainerStyle={{
              paddingVertical: itemHeight * 2,
            }}
          >
            {data.map((item, index) => {
              const isSelected = item === selectedValue;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    onValueChange(item);
                    scrollViewRef.current?.scrollTo({
                      y: index * itemHeight,
                      animated: true,
                    });
                  }}
                  className="justify-center items-center"
                  style={{ height: itemHeight }}
                >
                  <View
                    style={{
                      height: itemHeight,
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      backgroundColor: isSelected ? 'transparent' : 'transparent',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: isSelected ? 24 : 16,
                        fontWeight: isSelected ? '700' : '400',
                        color: isSelected ? '#00AAEC' : '#A0AEC0',
                        opacity: isSelected ? 1 : 0.5,
                        textAlign: 'center',
                        letterSpacing: isSelected ? 0.5 : 0,
                        backgroundColor: 'transparent',
                      }}
                    >
                      {item}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      );
    };

    return (
      <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl">
            <View className="flex-row justify-between items-center p-5 border-b border-gray-100">
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text className="text-gray-500 text-base">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-gray-900 text-lg font-semibold">Select Birth Date</Text>
              <TouchableOpacity onPress={() => handleDateSelect(tempDate)}>
                <Text className="text-[#00AAEC] text-base font-semibold">Done</Text>
              </TouchableOpacity>
            </View>

            <View className="px-5 py-4">
              <Text className="text-center text-lg font-medium text-gray-900 mb-6">
                {tempDate.getDate().toString().padStart(2, '0')}/{(tempDate.getMonth() + 1).toString().padStart(2, '0')}/{tempDate.getFullYear()}
              </Text>

              <View className="flex-row justify-between items-center" style={{ height: 250 }}>
                {/* Day Picker */}
                <View className="flex-1">
                  <Text className="text-center text-sm font-medium text-gray-700 mb-2">Day</Text>
                  <WheelPicker
                    data={days}
                    selectedValue={tempDate.getDate()}
                    onValueChange={(day) => {
                      const newDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), day as number);
                      setTempDate(newDate);
                    }}
                  />
                </View>

                <View className="w-px bg-gray-200 mx-2" style={{ height: 200 }} />

                <View className="flex-1">
                  <Text className="text-center text-sm font-medium text-gray-700 mb-2">Month</Text>
                  <WheelPicker
                    data={months}
                    selectedValue={months[tempDate.getMonth()]}
                    onValueChange={(month) => {
                      const monthIndex = months.indexOf(month as string);
                      const newDate = new Date(tempDate.getFullYear(), monthIndex, tempDate.getDate());
                      // Ajustar el día si el mes nuevo tiene menos días
                      const daysInNewMonth = getDaysInMonth(newDate.getFullYear(), monthIndex);
                      if (newDate.getDate() > daysInNewMonth) {
                        newDate.setDate(daysInNewMonth);
                      }
                      setTempDate(newDate);
                    }}
                  />
                </View>

                <View className="w-px bg-gray-200 mx-2" style={{ height: 200 }} />

                <View className="flex-1">
                  <Text className="text-center text-sm font-medium text-gray-700 mb-2">Year</Text>
                  <WheelPicker
                    data={years}
                    selectedValue={tempDate.getFullYear()}
                    onValueChange={(year) => {
                      const newDate = new Date(year as number, tempDate.getMonth(), tempDate.getDate());
                      const daysInNewMonth = getDaysInMonth(year as number, newDate.getMonth());
                      if (newDate.getDate() > daysInNewMonth) {
                        newDate.setDate(daysInNewMonth);
                      }
                      setTempDate(newDate);
                    }}
                  />
                </View>
              </View>

              <View className="h-4" />
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  React.useEffect(() => {
    if (currentStep > 1) {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableOpacity onPress={onBack}>
            <Text className="text-[#00AAEC] text-base">Back</Text>
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({ headerLeft: undefined, headerBackVisible: true });
    }
  }, [navigation, currentStep, onBack]);

  const getCurrentFormState = () => {
    if (currentStep === 1) return emailOrPhoneForm.formState;
    if (currentStep === 2) return passwordForm.formState;
    if (currentStep === 3) return profileForm.formState;
    return { isValid: false, isSubmitting: false };
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const ok = await emailOrPhoneForm.trigger();
      if (ok) setCurrentStep(2);
    } else if (currentStep === 2) {
      const ok = await passwordForm.trigger();
      if (ok) setCurrentStep(3);
    } else if (currentStep === 3) {
      const ok = await profileForm.trigger();
      if (ok) {
        const userData = {
          ...emailOrPhoneForm.getValues(),
          ...passwordForm.getValues(),
          ...profileForm.getValues(),
        };
        try {
          const result = await registerMutation.mutateAsync(userData);
          if (!result.success) {
            Alert.alert("Error", 'error' in result ? result.error : "Error creating user");
            return;
          }

          if (useEmail && 'user' in result && result.user) {
            const email = emailOrPhoneForm.getValues("emailOrPhone");
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
                    emailOrPhoneForm.setValue("emailOrPhone", "");
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

  const renderStep1 = () => (
    <View className="items-center mb-8">
      <Text className="text-3xl font-bold text-gray-900 mb-2">Join TwitterClone</Text>
      <Text className="text-base text-gray-500 text-center mb-8">Let&apos;s start with your email</Text>

      <View className="w-full">
        <Controller
          control={emailOrPhoneForm.control}
          name="emailOrPhone"
          render={({ field: { onChange, value } }) => (
            <View className="bg-white border border-gray-200 rounded-xl mb-3">
              <TextInput
                className="px-4 py-3 text-base text-gray-900"
                style={{ minHeight: 48, fontSize: 16, color: '#1A202C' }}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={onChange}
                value={value}
                placeholderTextColor="#A0AEC0"
                numberOfLines={1}
                textAlignVertical="center"
                allowFontScaling={true}
                autoFocus={true}
              />
            </View>
          )}
        />
        {emailOrPhoneForm.formState.errors.emailOrPhone && (
          <Text className="text-red-500 text-xs mb-2">{emailOrPhoneForm.formState.errors.emailOrPhone.message}</Text>
        )}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View className="items-center mb-8">
      <Text className="text-3xl font-bold text-gray-900 mb-2">Create your password</Text>
      <Text className="text-base text-gray-500 text-center mb-8">Make sure it&apos;s secure</Text>

      <View className="w-full">
        <Controller
          control={passwordForm.control}
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
        {passwordForm.formState.errors.password && (
          <Text className="text-red-500 text-xs mb-2">{passwordForm.formState.errors.password.message}</Text>
        )}

        <Controller
          control={passwordForm.control}
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
        {passwordForm.formState.errors.confirmPassword && (
          <Text className="text-red-500 text-xs mb-2">{passwordForm.formState.errors.confirmPassword.message}</Text>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View className="items-center mb-8">
      <Text className="text-3xl font-bold text-gray-900 mb-2">Tell us about yourself</Text>
      <Text className="text-base text-gray-500 text-center mb-8">Complete your profile</Text>

      <View className="w-full">
        <View className="flex-row gap-3 mb-3">
          <Controller
            control={profileForm.control}
            name="firstName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                placeholder="First name"
                autoCapitalize="words"
                onChangeText={onChange}
                value={value}
                placeholderTextColor="#A0AEC0"
              />
            )}
          />
          <Controller
            control={profileForm.control}
            name="lastName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900"
                placeholder="Last name"
                autoCapitalize="words"
                onChangeText={onChange}
                value={value}
                placeholderTextColor="#A0AEC0"
              />
            )}
          />
        </View>
        {(profileForm.formState.errors.firstName || profileForm.formState.errors.lastName) && (
          <Text className="text-red-500 text-xs mb-2">
            {profileForm.formState.errors.firstName?.message || profileForm.formState.errors.lastName?.message}
          </Text>
        )}

        <Controller
          control={profileForm.control}
          name="username"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base text-gray-900"
              placeholder="@yourusername"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={onChange}
              value={value}
              placeholderTextColor="#A0AEC0"
            />
          )}
        />
        {profileForm.formState.errors.username && (
          <Text className="text-red-500 text-xs mb-2">{profileForm.formState.errors.username.message}</Text>
        )}

        <Controller
          control={profileForm.control}
          name="phoneNumber"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 text-base text-gray-900"
              placeholder="+1 234 567 8900"
              keyboardType="phone-pad"
              onChangeText={onChange}
              value={value}
              placeholderTextColor="#A0AEC0"
            />
          )}
        />
        {profileForm.formState.errors.phoneNumber && (
          <Text className="text-red-500 text-xs mb-2">{profileForm.formState.errors.phoneNumber.message}</Text>
        )}

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          className="bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 flex-row justify-between items-center"
        >
          <Text className={`text-base ${profileForm.watch("birthdate") ? 'text-gray-900' : 'text-gray-400'}`}>
            {selectedDate ? formatDateForDisplay(selectedDate) : "Select birth date"}
          </Text>
          <Text className="text-gray-400">📅</Text>
        </TouchableOpacity>
        {profileForm.formState.errors.birthdate && (
          <Text className="text-red-500 text-xs mb-2">{profileForm.formState.errors.birthdate.message}</Text>
        )}
      </View>
    </View>
  );

  const currentFormState = getCurrentFormState();

  return (
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

      <DatePickerModal />
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
