import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { trpc } from '../../lib/trpc';
import EmailIcon from '../../components/icons/email-icon';
import ErrorIcon from '../../components/icons/error-icon';

const VerifyEmailScreen = () => {
  const router = useRouter();
  const { email = "user@example.com" } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  const verifyCodeMutation = trpc.auth.verifyCode.useMutation();
  const sendEmailMutation = trpc.email.sendActivationEmail.useMutation();

  const isEmail = email.includes('@');
  const maskedContact = isEmail 
    ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : email.replace(/(\+?\d{1,3})(\d{3,})(\d{4})/, '$1***$3');

  useEffect(() => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    setResendTimer(60);
    setCanResend(false);
  }, [fadeAnimation]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  useEffect(() => {
    const isCompleteCode = code.every(digit => digit !== '');
    setIsComplete(isCompleteCode);
    if (isCompleteCode) {
      setError('');
    }
  }, [code]);

  const triggerShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleInputChange = (index: number, value: string) => {
    
    const cleanValue = value.replace(/[^0-9]/g, '');
    
    if (cleanValue.length === 0 && value.length > 0) return;
    
    const newCode = [...code];
    newCode[index] = cleanValue.slice(-1);
    setCode(newCode);
    setError('');

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit !== '') && cleanValue) {
      setTimeout(() => handleVerify(newCode.join('')), 300);
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');
    setIsLoading(true);
    setError('');

    try {
      await verifyCodeMutation.mutateAsync({
        email,
        code: codeToVerify,
      });

      router.replace('/home-screen');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code. Please check and try again.");
      setCode(['', '', '', '', '', '']);
      triggerShakeAnimation();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await sendEmailMutation.mutateAsync({
        to: email,
      });

      setResendTimer(60);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-slate-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        className="flex-grow min-h-full"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          className="flex-1 px-6 pt-16 pb-8"
          style={[
            { opacity: fadeAnimation }
          ]}
        >
          {isComplete && (
            <View className="mb-10">
              <View className="h-1 bg-gray-200 rounded-sm overflow-hidden">
                <View className="h-full w-full bg-[#00AAEC] rounded-sm" />
              </View>
            </View>
          )}

          <View className="items-center mb-10">
            <View className="mb-5">
              <EmailIcon width={48} height={48} color="#00AAEC" />
            </View>
            
            <Text className="text-3xl font-bold text-gray-900 mb-2 text-center">Check your {isEmail ? 'email' : 'phone'}</Text>
            <Text className="text-base text-gray-500 text-center mb-1 leading-6">
              We&apos;ve sent a 6-digit verification code to
            </Text>
            <Text className="text-lg font-semibold text-[#00AAEC] text-center">{maskedContact}</Text>
          </View>

          <Animated.View 
            className="mb-10"
            style={[
              { transform: [{ translateX: shakeAnimation }] }
            ]}
          >
            <Text className="text-base font-semibold text-gray-700 text-center mb-5">Enter verification code</Text>
            
            <View className="flex-row justify-center mb-4 gap-3.5">
              {code.map((digit, index) => (
                <View key={index} className="relative">
                  <TextInput
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    className={`w-14 h-14 border-2 rounded-xl text-center text-2xl font-bold text-gray-900 ${
                      digit ? 'border-[#00AAEC] bg-white shadow-lg' : 'border-gray-300 bg-gray-50'
                    } ${error ? 'border-red-500 bg-red-50' : ''} ${isLoading ? 'opacity-60' : ''}`}
                    value={digit}
                    onChangeText={(value) => handleInputChange(index, value)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!isLoading}
                    autoFocus={index === 0}
                    autoCorrect={false}
                    autoCapitalize="none"
                    spellCheck={false}
                    textContentType="oneTimeCode"
                    importantForAutofill="yes"
                  />
                </View>
              ))}
            </View>

            {error ? (
              <View className="items-center min-h-6 bg-red-50 rounded-lg border border-red-200 px-3 py-2 mt-2">
                <View className="flex-row items-center justify-center gap-2">
                  <ErrorIcon width={16} height={16} color="#dc2626" />
                  <Text className="text-sm text-red-600 text-center font-medium flex-1">{error}</Text>
                </View>
              </View>
            ) : (
              <View className="items-center min-h-6">
                <Text className="text-sm text-gray-500 text-center">
                  {isComplete ? '✓ Code complete' : 'Enter all 6 digits'}
                </Text>
              </View>
            )}
          </Animated.View>

          <View className="mb-8 gap-4">
          
            <View className="items-center gap-3">
              <Text className="text-sm text-gray-500 text-center">
                Didn&apos;t receive the code?
              </Text>
              {canResend ? (
                <TouchableOpacity 
                  className="py-2.5 px-4 rounded-lg border border-[#00AAEC] bg-transparent"
                  onPress={handleResend}
                  activeOpacity={0.7}
                >
                  <Text className="text-base text-[#00AAEC] font-semibold">Resend Code</Text>
                </TouchableOpacity>
              ) : (
                <View className="items-center py-2 gap-2">
                  <Text className="text-sm text-gray-500 text-center">
                    Resend available in
                  </Text>
                  <View className="bg-gray-100 px-3 py-1.5 rounded-full border border-gray-300">
                    <Text className="text-base font-bold text-gray-700">{resendTimer}s</Text>
                  </View>
                </View>
              )}
            </View>

            {isComplete && !isLoading && (
              <TouchableOpacity
                className="bg-[#00AAEC] py-4 rounded-xl items-center shadow-lg"
                onPress={() => handleVerify()}
                activeOpacity={0.8}
              >
                <Text className="text-white text-lg font-bold">Verify Code</Text>
              </TouchableOpacity>
            )}

            {isLoading && (
              <View className="items-center py-4">
                <Text className="text-base text-gray-500 italic">Verifying...</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <TouchableOpacity 
            className="items-center py-3"
            onPress={() => router.push('/sign-up')}
            activeOpacity={0.7}
          >
            <Text className="text-sm text-gray-500 text-center">← Change email address</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default VerifyEmailScreen;
