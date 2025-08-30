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
  useWindowDimensions,
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

export default function SignUpScreen({ currentStep, setCurrentStep, onBack }: SignUpScreenProps) {
  const [useEmail, setUseEmail] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const router = useRouter();
  const navigation = useNavigation();

  const { width, height } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 768;
  const isLandscape = width > height;

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
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    return (
      <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>

            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={{ color: '#6b7280', fontSize: 16 }}>Cancel</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>Select Birth Date</Text>
              <TouchableOpacity onPress={() => handleDateSelect(tempDate)}>
                <Text style={{ color: '#00AAEC', fontSize: 16, fontWeight: '600' }}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={{ padding: 20, gap: 16 }}>
              <Text style={{ textAlign: 'center', marginBottom: 8 }}>
                {formatDateForDisplay(tempDate)}
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                {years.map(year => (
                  <TouchableOpacity
                    key={year}
                    onPress={() => setTempDate(new Date(year, tempDate.getMonth(), tempDate.getDate()))}
                    style={{
                      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
                      backgroundColor: tempDate.getFullYear() === year ? '#00AAEC' : '#f3f4f6'
                    }}>
                    <Text style={{ color: tempDate.getFullYear() === year ? 'white' : '#374151' }}>{year}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                {months.map((month, idx) => (
                  <TouchableOpacity
                    key={month}
                    onPress={() => setTempDate(new Date(tempDate.getFullYear(), idx, tempDate.getDate()))}
                    style={{
                      paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
                      backgroundColor: tempDate.getMonth() === idx ? '#00AAEC' : '#f3f4f6'
                    }}>
                    <Text style={{ color: tempDate.getMonth() === idx ? 'white' : '#374151' }}>{month}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
                {days.map(day => {
                  const daysInMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate();
                  if (day > daysInMonth) return null;
                  return (
                    <TouchableOpacity
                      key={day}
                      onPress={() => setTempDate(new Date(tempDate.getFullYear(), tempDate.getMonth(), day))}
                      style={{
                        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
                        backgroundColor: tempDate.getDate() === day ? '#00AAEC' : '#f3f4f6'
                      }}>
                      <Text style={{ color: tempDate.getDate() === day ? 'white' : '#374151' }}>{day}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
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
            <Text style={{ color: "#00AAEC", fontSize: 16 }}>Back</Text>
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({ headerLeft: undefined, headerBackVisible: true });
    }
  }, [navigation, currentStep, onBack]);

  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) return emailOrPhoneForm.formState.isValid;
    if (currentStep === 2) return passwordForm.formState.isValid;
    if (currentStep === 3) return profileForm.formState.isValid;
    return false;
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

          if (useEmail) {
            const email = emailOrPhoneForm.getValues("emailOrPhone");
            const sendResult = await sendEmailMutation.mutateAsync({ to: email });
            if (sendResult.success) {
              router.push(`/verify-email?email=${encodeURIComponent(email)}`);
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
    <View style={{ marginVertical: isLandscape ? 16 : 32 }}>
      <View style={{ marginVertical: 12 }}>
        <Text style={{
          fontSize: isSmallDevice ? 24 : isTablet ? 36 : 30,
          fontWeight: 'bold',
          color: '#111827',
          textAlign: 'center'
        }}>
          Join TwitterClone
        </Text>
        <Text style={{
          color: '#6b7280',
          textAlign: 'center',
          fontSize: isSmallDevice ? 16 : isTablet ? 20 : 18,
          marginTop: 12,
          paddingHorizontal: isSmallDevice ? 16 : 0
        }}>
          Let&apos;s start with your email
        </Text>
      </View>

      <View style={{ marginVertical: isLandscape ? 16 : 24 }}>
        <View>
          <Text style={{
            fontSize: isSmallDevice ? 14 : 16,
            fontWeight: '500',
            color: '#374151',
            marginBottom: 12
          }}>
            {useEmail ? "Email" : "Phone Number"}
          </Text>
          <Controller
            control={emailOrPhoneForm.control}
            name="emailOrPhone"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    width: '100%',
                    fontSize: isSmallDevice ? 14 : 16,
                    paddingVertical: isSmallDevice ? 12 : 16,
                    paddingHorizontal: isSmallDevice ? 12 : 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: emailOrPhoneForm.formState.errors.emailOrPhone ? '#fca5a5' : '#e5e7eb',
                    backgroundColor: 'white',
                    color: '#111827',
                    height: isSmallDevice ? 48 : isTablet ? 64 : 56,
                    textAlignVertical: 'center',
                  }}
                  placeholderTextColor="#9CA3AF"
                />
                {emailOrPhoneForm.formState.errors.emailOrPhone && (
                  <Text style={{
                    marginTop: 8,
                    fontSize: isSmallDevice ? 12 : 14,
                    color: '#dc2626'
                  }}>
                    {emailOrPhoneForm.formState.errors.emailOrPhone.message}
                  </Text>
                )}
              </>
            )}
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={{ marginVertical: isLandscape ? 16 : 32 }}>
      <View style={{ marginVertical: 12 }}>
        <Text style={{
          fontSize: isSmallDevice ? 24 : isTablet ? 36 : 30,
          fontWeight: 'bold',
          color: '#111827',
          textAlign: 'center'
        }}>
          Create your password
        </Text>
        <Text style={{
          color: '#6b7280',
          textAlign: 'center',
          fontSize: isSmallDevice ? 16 : isTablet ? 20 : 18,
          marginTop: 12,
          paddingHorizontal: isSmallDevice ? 16 : 0
        }}>
          Make sure it&apos;s secure
        </Text>
      </View>

      <View style={{ marginVertical: isLandscape ? 16 : 24 }}>
        <View>
          <Text style={{
            fontSize: isSmallDevice ? 14 : 16,
            fontWeight: '500',
            color: '#374151',
            marginBottom: 12
          }}>
            Password
          </Text>
          <Controller
            control={passwordForm.control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Minimum 8 characters"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    width: '100%',
                    fontSize: isSmallDevice ? 14 : 16,
                    paddingVertical: isSmallDevice ? 12 : 16,
                    paddingHorizontal: isSmallDevice ? 12 : 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: passwordForm.formState.errors.password ? '#fca5a5' : '#e5e7eb',
                    backgroundColor: 'white',
                    color: '#111827',
                    height: isSmallDevice ? 48 : isTablet ? 64 : 56,
                    textAlignVertical: 'center',
                  }}
                  placeholderTextColor="#9CA3AF"
                />
                {passwordForm.formState.errors.password && (
                  <Text style={{
                    marginTop: 8,
                    fontSize: isSmallDevice ? 12 : 14,
                    color: '#dc2626'
                  }}>
                    {passwordForm.formState.errors.password.message}
                  </Text>
                )}
              </>
            )}
          />
        </View>

        <View style={{ marginTop: isLandscape ? 16 : 24 }}>
          <Text style={{
            fontSize: isSmallDevice ? 14 : 16,
            fontWeight: '500',
            color: '#374151',
            marginBottom: 12
          }}>
            Confirm Password
          </Text>
          <Controller
            control={passwordForm.control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Repeat your password"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    width: '100%',
                    fontSize: isSmallDevice ? 14 : 16,
                    paddingVertical: isSmallDevice ? 12 : 16,
                    paddingHorizontal: isSmallDevice ? 12 : 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: passwordForm.formState.errors.confirmPassword ? '#fca5a5' : '#e5e7eb',
                    backgroundColor: 'white',
                    color: '#111827',
                    height: isSmallDevice ? 48 : isTablet ? 64 : 56,
                    textAlignVertical: 'center',
                  }}
                  placeholderTextColor="#9CA3AF"
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <Text style={{
                    marginTop: 8,
                    fontSize: isSmallDevice ? 12 : 14,
                    color: '#dc2626'
                  }}>
                    {passwordForm.formState.errors.confirmPassword.message}
                  </Text>
                )}
              </>
            )}
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={{ marginVertical: isLandscape ? 16 : 32 }}>
      <View style={{ marginVertical: 12 }}>
        <Text style={{
          fontSize: isSmallDevice ? 24 : isTablet ? 36 : 30,
          fontWeight: 'bold',
          color: '#111827',
          textAlign: 'center'
        }}>
          Tell us about yourself
        </Text>
        <Text style={{
          color: '#6b7280',
          textAlign: 'center',
          fontSize: isSmallDevice ? 16 : isTablet ? 20 : 18,
          marginTop: 12,
          paddingHorizontal: isSmallDevice ? 16 : 0
        }}>
          Complete your profile
        </Text>
      </View>

      <View style={{ marginVertical: isLandscape ? 16 : 24 }}>
        <View style={{
          flexDirection: isLandscape && isTablet ? 'row' : 'column',
          gap: isLandscape && isTablet ? 24 : 12
        }}>
          <View style={{ flex: isLandscape && isTablet ? 1 : undefined }}>
            <Text style={{
              fontSize: isSmallDevice ? 14 : 16,
              fontWeight: '500',
              color: '#374151',
              marginBottom: 12
            }}>
              First Name
            </Text>
            <Controller
              control={profileForm.control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Your first name"
                    autoCapitalize="words"
                    style={{
                      width: '100%',
                      fontSize: isSmallDevice ? 14 : 16,
                      paddingVertical: isSmallDevice ? 12 : 16,
                      paddingHorizontal: isSmallDevice ? 12 : 16,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: profileForm.formState.errors.firstName ? '#fca5a5' : '#e5e7eb',
                      backgroundColor: 'white',
                      color: '#111827',
                      height: isSmallDevice ? 48 : isTablet ? 64 : 56,
                      textAlignVertical: 'center',
                    }}
                    placeholderTextColor="#9CA3AF"
                  />
                  {profileForm.formState.errors.firstName && (
                    <Text style={{
                      marginTop: 8,
                      fontSize: isSmallDevice ? 12 : 14,
                      color: '#dc2626'
                    }}>
                      {profileForm.formState.errors.firstName.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={{ flex: isLandscape && isTablet ? 1 : undefined }}>
            <Text style={{
              fontSize: isSmallDevice ? 14 : 16,
              fontWeight: '500',
              color: '#374151',
              marginBottom: 12
            }}>
              Last Name
            </Text>
            <Controller
              control={profileForm.control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Your last name"
                    autoCapitalize="words"
                    style={{
                      width: '100%',
                      fontSize: isSmallDevice ? 14 : 16,
                      paddingVertical: isSmallDevice ? 12 : 16,
                      paddingHorizontal: isSmallDevice ? 12 : 16,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: profileForm.formState.errors.lastName ? '#fca5a5' : '#e5e7eb',
                      backgroundColor: 'white',
                      color: '#111827',
                      height: isSmallDevice ? 48 : isTablet ? 64 : 56,
                      textAlignVertical: 'center',
                    }}
                    placeholderTextColor="#9CA3AF"
                  />
                  {profileForm.formState.errors.lastName && (
                    <Text style={{
                      marginTop: 8,
                      fontSize: isSmallDevice ? 12 : 14,
                      color: '#dc2626'
                    }}>
                      {profileForm.formState.errors.lastName.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>
        </View>

        <View style={{ marginTop: isLandscape ? 16 : 24 }}>
          <Text style={{
            fontSize: isSmallDevice ? 14 : 16,
            fontWeight: '500',
            color: '#374151',
            marginBottom: 12
          }}>
            Username
          </Text>
          <Controller
            control={profileForm.control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="@yourusername"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    width: '100%',
                    fontSize: isSmallDevice ? 14 : 16,
                    paddingVertical: isSmallDevice ? 12 : 16,
                    paddingHorizontal: isSmallDevice ? 12 : 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: profileForm.formState.errors.username ? '#fca5a5' : '#e5e7eb',
                    backgroundColor: 'white',
                    color: '#111827',
                    height: isSmallDevice ? 48 : isTablet ? 64 : 56,
                    textAlignVertical: 'center',
                  }}
                  placeholderTextColor="#9CA3AF"
                />
                {profileForm.formState.errors.username && (
                  <Text style={{
                    marginTop: 8,
                    fontSize: isSmallDevice ? 12 : 14,
                    color: '#dc2626'
                  }}>
                    {profileForm.formState.errors.username.message}
                  </Text>
                )}
              </>
            )}
          />
        </View>

        <View style={{
          marginTop: isLandscape ? 16 : 24,
          flexDirection: isLandscape && isTablet ? 'row' : 'column',
          gap: isLandscape && isTablet ? 24 : (isLandscape ? 16 : 24)
        }}>
          <View style={{ flex: isLandscape && isTablet ? 1 : undefined }}>
            <Text style={{
              fontSize: isSmallDevice ? 14 : 16,
              fontWeight: '500',
              color: '#374151',
              marginBottom: 12
            }}>
              Phone Number
            </Text>
            <Controller
              control={profileForm.control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="+1 234 567 8900"
                    keyboardType="phone-pad"
                    style={{
                      width: '100%',
                      fontSize: isSmallDevice ? 14 : 16,
                      paddingVertical: isSmallDevice ? 12 : 16,
                      paddingHorizontal: isSmallDevice ? 12 : 16,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: profileForm.formState.errors.phoneNumber ? '#fca5a5' : '#e5e7eb',
                      backgroundColor: 'white',
                      color: '#111827',
                      height: isSmallDevice ? 48 : isTablet ? 64 : 56,
                      textAlignVertical: 'center',
                    }}
                    placeholderTextColor="#9CA3AF"
                  />
                  {profileForm.formState.errors.phoneNumber && (
                    <Text style={{
                      marginTop: 8,
                      fontSize: isSmallDevice ? 12 : 14,
                      color: '#dc2626'
                    }}>
                      {profileForm.formState.errors.phoneNumber.message}
                    </Text>
                  )}
                </>
              )}
            />
          </View>

          <View style={{ flex: isLandscape && isTablet ? 1 : undefined }}>
            <Text style={{
              fontSize: isSmallDevice ? 14 : 16,
              fontWeight: '500',
              color: '#374151',
              marginBottom: 12
            }}>
              Birth Date
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                width: '100%',
                paddingVertical: isSmallDevice ? 12 : 16,
                paddingHorizontal: isSmallDevice ? 12 : 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: profileForm.formState.errors.birthdate ? '#fca5a5' : '#e5e7eb',
                backgroundColor: 'white',
                height: isSmallDevice ? 48 : isTablet ? 64 : 56,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{
                fontSize: isSmallDevice ? 14 : 16,
                color: profileForm.watch("birthdate") ? '#111827' : '#9CA3AF'
              }}>
                {profileForm.watch("birthdate") || 'Select your birth date'}
              </Text>
              <Text style={{
                fontSize: 18,
                color: '#6b7280'
              }}>
                📅
              </Text>
            </TouchableOpacity>
            {profileForm.formState.errors.birthdate && (
              <Text style={{
                marginTop: 8,
                fontSize: isSmallDevice ? 12 : 14,
                color: '#dc2626'
              }}>
                {profileForm.formState.errors.birthdate.message}
              </Text>
            )}
          </View>
        </View>

        <View style={{ marginTop: isLandscape ? 16 : 24 }}>
          <Text style={{
            fontSize: isSmallDevice ? 14 : 16,
            fontWeight: '500',
            color: '#374151',
            marginBottom: 12
          }}>
            Profile Picture (optional)
          </Text>
          <View style={{
            flexDirection: isSmallDevice ? 'column' : 'row',
            alignItems: isSmallDevice ? 'center' : 'center',
            gap: isSmallDevice ? 12 : 16
          }}>
            <View style={{
              width: isSmallDevice ? 60 : isTablet ? 100 : 80,
              height: isSmallDevice ? 60 : isTablet ? 100 : 80,
              backgroundColor: '#00AAEC',
              borderRadius: isSmallDevice ? 30 : isTablet ? 50 : 40,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{
                color: 'white',
                fontWeight: 'bold',
                fontSize: isSmallDevice ? 18 : isTablet ? 32 : 24
              }}>
                {profileForm.watch("firstName")?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert("Select Image", "This functionality will be available soon.")}
              style={{
                backgroundColor: '#00AAEC',
                paddingVertical: isSmallDevice ? 10 : 12,
                paddingHorizontal: isSmallDevice ? 20 : 24,
                borderRadius: 12,
                flex: isSmallDevice ? undefined : 1,
                minWidth: isSmallDevice ? 120 : undefined
              }}
            >
              <Text style={{
                color: 'white',
                fontWeight: '600',
                textAlign: 'center',
                fontSize: isSmallDevice ? 16 : isTablet ? 20 : 18
              }}>
                Select Image
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#f8fafc' }}
    >
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: isSmallDevice ? 16 : isTablet ? 32 : 20,
          paddingTop: isLandscape ? 20 : isSmallDevice ? 40 : 60,
          paddingBottom: isLandscape ? 20 : 40
        }}
      >
        <View style={{ flex: 1, justifyContent: isLandscape ? 'flex-start' : 'center' }}>
          {/* Header */}
          <View style={{ marginBottom: isLandscape ? 16 : 24 }}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Svg
                width={isSmallDevice ? 48 : isTablet ? 72 : 56}
                height={isSmallDevice ? 48 : isTablet ? 72 : 56}
                viewBox="0 -4 48 48"
              >
                <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                  <G transform="translate(-300, -164)" fill="#00AAEC">
                    <Path d="M348,168.735283 C346.236309,169.538462 344.337383,170.081618 342.345483,170.324305 C344.379644,169.076201 345.940482,167.097147 346.675823,164.739617 C344.771263,165.895269 342.666667,166.736006 340.418384,167.18671 C338.626519,165.224991 336.065504,164 333.231203,164 C327.796443,164 323.387216,168.521488 323.387216,174.097508 C323.387216,174.88913 323.471738,175.657638 323.640782,176.397255 C315.456242,175.975442 308.201444,171.959552 303.341433,165.843265 C302.493397,167.339834 302.008804,169.076201 302.008804,170.925244 C302.008804,174.426869 303.747139,177.518238 306.389857,179.329722 C304.778306,179.280607 303.256911,178.821235 301.9271,178.070061 L301.9271,178.194294 C301.9271,183.08848 305.322064,187.17082 309.8299,188.095341 C309.004402,188.33225 308.133826,188.450704 307.235077,188.450704 C306.601162,188.450704 305.981335,188.390033 305.381229,188.271578 C306.634971,192.28169 310.269414,195.2026 314.580032,195.280607 C311.210424,197.99061 306.961789,199.605634 302.349709,199.605634 C301.555203,199.605634 300.769149,199.559408 300,199.466956 C304.358514,202.327194 309.53689,204 315.095615,204 C333.211481,204 343.114633,204 343.114633,175.270495 C343.114633,174.831347 343.106181,174.392199 343.089276,173.961719 C345.013559,172.537378 346.684275,170.760563 348,168.735283" />
                  </G>
                </G>
              </Svg>
            </View>

            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 12,
              marginBottom: isLandscape ? 16 : 24
            }}>
              {[1, 2, 3].map((step) => (
                <View
                  key={step}
                  style={{
                    width: isSmallDevice ? 12 : 16,
                    height: isSmallDevice ? 12 : 16,
                    borderRadius: isSmallDevice ? 6 : 8,
                    backgroundColor: step <= currentStep ? "#00AAEC" : "#d1d5db"
                  }}
                />
              ))}
            </View>
          </View>

          {/* Form Container */}
          <View style={{
            backgroundColor: 'white',
            borderRadius: isSmallDevice ? 16 : isTablet ? 32 : 24,
            padding: isSmallDevice ? 20 : isTablet ? 40 : 32,
            marginBottom: isLandscape ? 16 : 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <View style={{ marginTop: 5 }}>
              <TouchableOpacity
                onPress={handleNext}
                disabled={!validateCurrentStep()}
                style={{
                  width: '100%',
                  paddingVertical: isSmallDevice ? 14 : isTablet ? 20 : 16,
                  paddingHorizontal: isSmallDevice ? 20 : 24,
                  borderRadius: isSmallDevice ? 12 : 16,
                  backgroundColor: validateCurrentStep() ? '#00AAEC' : '#d1d5db',
                }}
              >
                <Text style={{
                  fontWeight: 'bold',
                  fontSize: isSmallDevice ? 18 : isTablet ? 24 : 20,
                  textAlign: 'center',
                  color: validateCurrentStep() ? 'white' : '#6b7280'
                }}>
                  {currentStep === 3 ? "Create Account" : "Next"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={{ marginTop: isLandscape ? 16 : 24 }}>
            <Text style={{
              color: '#6b7280',
              fontSize: isSmallDevice ? 14 : isTablet ? 18 : 16,
              textAlign: 'center'
            }}>
              Already have an account?{" "}
              <Text style={{ color: '#00AAEC', fontWeight: '500' }}>
                Sign in
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>

      <DatePickerModal />
    </KeyboardAvoidingView>
  );
}