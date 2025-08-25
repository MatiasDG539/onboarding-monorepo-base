import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email = "user@example.com" } = useLocalSearchParams<{ email: string }>();
  const { width, height } = useWindowDimensions();
  
  const isSmallDevice = width < 375;
  const isLargeDevice = width > 414;
  const isLandscape = width > height;
  
  const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

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

  // Check if code is complete
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
    // Remove any non-numeric characters and accents
    const cleanValue = value.replace(/[^0-9]/g, '');
    
    if (cleanValue.length === 0 && value.length > 0) return; // Reject non-numeric input
    
    const newCode = [...code];
    newCode[index] = cleanValue.slice(-1);
    setCode(newCode);
    setError('');

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when complete
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
      console.log('Sending verification request:', { email, code: codeToVerify });

      const response = await fetch("http://localhost:3001/api/verifyCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeToVerify }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('HTTP error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const responseText = await response.text();
        console.error("Non-JSON response:", responseText);
        throw new Error(`Expected JSON response, got: ${contentType}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        router.replace('/(tabs)');
      } else {
        setError(data.error || "Incorrect code. Please try again.");
        setCode(['', '', '', '', '', '']);
        triggerShakeAnimation();
        setTimeout(() => inputRefs.current[0]?.focus(), 100);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : "Error verifying code. Please try again.");
      triggerShakeAnimation();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    try {
      console.log('Resending verification code to:', email);
      
      const response = await fetch("http://localhost:3001/api/sendEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResendTimer(60);
        setCanResend(false);
        setCode(['', '', '', '', '', '']);
        setError('');
        inputRefs.current[0]?.focus();
      } else {
        setError("Failed to resend code. Please try again.");
      }
    } catch (err) {
      console.error('Resend error:', err);
      setError("Error resending code. Please try again.");
    }
  };

  const styles = createMobileStyles(isSmallDevice, isLargeDevice, isLandscape, width);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          style={[
            styles.content,
            { opacity: fadeAnimation }
          ]}
        >
          {isComplete && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
              </View>
            </View>
          )}

          <View style={styles.headerSection}>
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                  <Path 
                    d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" 
                    stroke="#00AAEC" 
                    strokeWidth="2" 
                    fill="none"
                  />
                  <Path 
                    d="m22 6-10 7L2 6" 
                    stroke="#00AAEC" 
                    strokeWidth="2" 
                    fill="none"
                  />
                </Svg>
              </View>
            </View>
            
            <Text style={styles.title}>Check your {isEmail ? 'email' : 'phone'}</Text>
            <Text style={styles.subtitle}>
              We&apos;ve sent a 6-digit verification code to
            </Text>
            <Text style={styles.contactText}>{maskedContact}</Text>
          </View>

          <Animated.View 
            style={[
              styles.codeSection,
              { transform: [{ translateX: shakeAnimation }] }
            ]}
          >
            <Text style={styles.codeLabel}>Enter verification code</Text>
            
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <View key={index} style={styles.inputWrapper}>
                  <TextInput
                    ref={(ref) => { inputRefs.current[index] = ref; }}
                    style={[
                      styles.codeInput,
                      digit ? styles.codeInputFilled : styles.codeInputEmpty,
                      error ? styles.codeInputError : null,
                      isLoading ? styles.codeInputLoading : null
                    ]}
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
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>❌ {error}</Text>
              </View>
            ) : (
              <View style={styles.hintContainer}>
                <Text style={styles.hintText}>
                  {isComplete ? '✓ Code complete' : 'Enter all 6 digits'}
                </Text>
              </View>
            )}
          </Animated.View>

          <View style={styles.actionSection}>
          
            <View style={styles.resendContainer}>
              <Text style={styles.resendQuestion}>
                Didn&apos;t receive the code?
              </Text>
              {canResend ? (
                <TouchableOpacity 
                  style={styles.resendButton} 
                  onPress={handleResend}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resendButtonText}>Resend Code</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.timerContainer}>
                  <Text style={styles.timerText}>
                    Resend available in
                  </Text>
                  <View style={styles.timerBadge}>
                    <Text style={styles.timerNumber}>{resendTimer}s</Text>
                  </View>
                </View>
              )}
            </View>

            {isComplete && !isLoading && (
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={() => handleVerify()}
                activeOpacity={0.8}
              >
                <Text style={styles.verifyButtonText}>Verify Code</Text>
              </TouchableOpacity>
            )}

            {isLoading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Verifying...</Text>
              </View>
            )}
          </View>

          {/* Footer */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/sign-up')}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>← Change email address</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createMobileStyles = (isSmallDevice: boolean, isLargeDevice: boolean, isLandscape: boolean, width: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  content: {
    flex: 1,
    paddingHorizontal: isSmallDevice ? 20 : isLargeDevice ? 32 : 24,
    paddingTop: isLandscape ? 20 : (isSmallDevice ? 50 : 70),
    paddingBottom: 30,
  },
  
  progressContainer: {
    marginBottom: isLandscape ? 20 : (isSmallDevice ? 30 : 40),
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00AAEC',
    borderRadius: 2,
  },
  topTimerContainer: {
    alignItems: 'center',
    marginTop: 12,
  },
  topTimerText: {
    fontSize: isSmallDevice ? 11 : 12,
    color: '#9ca3af',
    fontWeight: '500',
  },

  headerSection: {
    alignItems: 'center',
    marginBottom: isLandscape ? 24 : (isSmallDevice ? 32 : 40),
  },
  iconContainer: {
    marginBottom: isSmallDevice ? 16 : 20,
  },
  iconCircle: {
    width: isSmallDevice ? 60 : 72,
    height: isSmallDevice ? 60 : 72,
    borderRadius: isSmallDevice ? 30 : 36,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#bfdbfe',
  },
  title: {
    fontSize: isSmallDevice ? 24 : isLargeDevice ? 32 : 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: isSmallDevice ? 20 : 22,
  },
  contactText: {
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: '600',
    color: '#00AAEC',
    textAlign: 'center',
  },

  codeSection: {
    marginBottom: isLandscape ? 24 : (isSmallDevice ? 32 : 40),
  },
  codeLabel: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: isSmallDevice ? 16 : 20,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: isSmallDevice ? 8 : isLargeDevice ? 16 : 12,
    marginBottom: 16,
  },
  inputWrapper: {
    position: 'relative',
  },
  codeInput: {
    width: isSmallDevice ? 44 : isLargeDevice ? 60 : 52,
    height: isSmallDevice ? 44 : isLargeDevice ? 60 : 52,
    borderWidth: 2,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: isSmallDevice ? 20 : isLargeDevice ? 28 : 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  codeInputEmpty: {
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  codeInputFilled: {
    borderColor: '#00AAEC',
    backgroundColor: 'white',
    shadowColor: '#00AAEC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  codeInputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  codeInputLoading: {
    opacity: 0.6,
  },
  checkmark: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

  hintContainer: {
    alignItems: 'center',
    minHeight: 24,
  },
  hintText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    minHeight: 24,
  },
  errorText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#ef4444',
    textAlign: 'center',
    fontWeight: '500',
  },

  actionSection: {
    gap: 16,
    marginBottom: isLandscape ? 20 : (isSmallDevice ? 24 : 32),
  },
  resendContainer: {
    alignItems: 'center',
    gap: 12,
  },
  resendQuestion: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  resendButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00AAEC',
    backgroundColor: 'transparent',
  },
  resendButtonText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#00AAEC',
    fontWeight: '600',
  },
  timerContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  timerText: {
    fontSize: isSmallDevice ? 12 : 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  timerBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  timerNumber: {
    fontSize: isSmallDevice ? 14 : 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  verifyButton: {
    backgroundColor: '#00AAEC',
    paddingVertical: isSmallDevice ? 14 : 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#00AAEC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: isSmallDevice ? 16 : 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: isSmallDevice ? 14 : 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },

  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: isSmallDevice ? 13 : 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
