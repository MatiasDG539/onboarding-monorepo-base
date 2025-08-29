import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform
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

interface SignUpScreenProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onBack?: () => void;
}

export default function SignUpScreen({ currentStep, setCurrentStep, onBack }: SignUpScreenProps) {
  const [useEmail, setUseEmail] = useState(true);

  const emailOrPhoneForm = useForm<SignUpStep1Data>({
    resolver: zodResolver(SignUpStep1Schema),
    mode: 'onChange',
    defaultValues: {
      emailOrPhone: "",
    }
  });

  const passwordForm = useForm<SignUpStep2Data>({
    resolver: zodResolver(SignUpStep2Schema),
    mode: 'onChange',
    defaultValues: {
      password: "",
      confirmPassword: "",
    }
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

  const pickImage = () => {
    Alert.alert(
      "Select Image", 
      "This functionality will be available soon.",
      [{ text: "OK" }]
    );
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      return emailOrPhoneForm.formState.isValid;
    } else if (currentStep === 2) {
      return passwordForm.formState.isValid;
    } else if (currentStep === 3) {
      return profileForm.formState.isValid;
    }
    return false;
  };

  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await emailOrPhoneForm.trigger();
      if (isValid) {
        setCurrentStep(currentStep + 1);
      }
    } else if (currentStep === 2) {
      const isValid = await passwordForm.trigger();
      if (isValid) {
        setCurrentStep(currentStep + 1);
      }
    } else if (currentStep === 3) {
      const isValid = await profileForm.trigger();
      if (isValid) {
        // Final step, handle account creation
        Alert.alert(
          "Account Created", 
          "Your account has been created successfully!",
          [{ text: "OK" }]
        );
      }
    }
  };

  const renderStep1 = () => (
    <View style={{ marginVertical: 32 }}>
      <View style={{ marginVertical: 12 }}>
        <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#111827', textAlign: 'center' }}>
          Join TwitterClone
        </Text>
        <Text style={{ color: '#6b7280', textAlign: 'center', fontSize: 18, marginTop: 12 }}>
          Let&apos;s start with your {useEmail ? "email" : "phone"}
        </Text>
      </View>

      <View style={{ marginVertical: 24 }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
            {useEmail ? "Email" : "Phone Number"}
          </Text>
          <TextInput
            placeholder={useEmail ? "your@email.com" : "+1 234 567 8900"}
            keyboardType={useEmail ? "email-address" : "phone-pad"}
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              width: '100%',
              fontSize: 16,
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: emailOrPhoneForm.formState.errors.emailOrPhone ? '#fca5a5' : '#e5e7eb',
              backgroundColor: 'white',
              color: '#111827',
              height: 56,
              textAlignVertical: 'center',
            }}
            placeholderTextColor="#9CA3AF"
            {...emailOrPhoneForm.register("emailOrPhone")}
          />
          {emailOrPhoneForm.formState.errors.emailOrPhone && (
            <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
              {emailOrPhoneForm.formState.errors.emailOrPhone.message}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => {
            setUseEmail(!useEmail);
            emailOrPhoneForm.setValue("emailOrPhone", "");
            emailOrPhoneForm.clearErrors("emailOrPhone");
          }}
          style={{ alignSelf: 'center', marginTop: 10 }}
        >
          <Text style={{ color: '#00AAEC', fontWeight: '500', fontSize: 18 }}>
            {useEmail ? "Use phone instead" : "Use email instead"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={{ marginVertical: 32 }}>
      <View style={{ marginVertical: 12 }}>
        <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#111827', textAlign: 'center' }}>
          Create your password
        </Text>
        <Text style={{ color: '#6b7280', textAlign: 'center', fontSize: 18, marginTop: 12 }}>
          Make sure it&apos;s secure
        </Text>
      </View>

      <View style={{ marginVertical: 24 }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
            Password
          </Text>
          <TextInput
            placeholder="Minimum 8 characters"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              width: '100%',
              fontSize: 16,
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: passwordForm.formState.errors.password ? '#fca5a5' : '#e5e7eb',
              backgroundColor: 'white',
              color: '#111827',
              height: 56,
              textAlignVertical: 'center',
            }}
            placeholderTextColor="#9CA3AF"
            {...passwordForm.register("password")}
          />
          {passwordForm.formState.errors.password && (
            <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
              {passwordForm.formState.errors.password.message}
            </Text>
          )}
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
            Confirm Password
          </Text>
          <TextInput
            placeholder="Repeat your password"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              width: '100%',
              fontSize: 16,
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: passwordForm.formState.errors.confirmPassword ? '#fca5a5' : '#e5e7eb',
              backgroundColor: 'white',
              color: '#111827',
              height: 56,
              textAlignVertical: 'center',
            }}
            placeholderTextColor="#9CA3AF"
            {...passwordForm.register("confirmPassword")}
          />
          {passwordForm.formState.errors.confirmPassword && (
            <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
              {passwordForm.formState.errors.confirmPassword.message}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={{ marginVertical: 32 }}>
      <View style={{ marginVertical: 12 }}>
        <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#111827', textAlign: 'center' }}>
          Tell us about yourself
        </Text>
        <Text style={{ color: '#6b7280', textAlign: 'center', fontSize: 18, marginTop: 12 }}>
          Complete your profile
        </Text>
      </View>

      <View style={{ marginVertical: 24 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
              First Name
            </Text>
            <TextInput
              placeholder="Your first name"
              autoCapitalize="words"
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: profileForm.formState.errors.firstName ? '#fca5a5' : '#e5e7eb',
                backgroundColor: 'white',
                color: '#111827',
                height: 56,
                textAlignVertical: 'center',
              }}
              placeholderTextColor="#9CA3AF"
              {...profileForm.register("firstName")}
            />
            {profileForm.formState.errors.firstName && (
              <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
                {profileForm.formState.errors.firstName.message}
              </Text>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
              Last Name
            </Text>
            <TextInput
              placeholder="Your last name"
              autoCapitalize="words"
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: profileForm.formState.errors.lastName ? '#fca5a5' : '#e5e7eb',
                backgroundColor: 'white',
                color: '#111827',
                height: 56,
                textAlignVertical: 'center',
              }}
              placeholderTextColor="#9CA3AF"
              {...profileForm.register("lastName")}
            />
            {profileForm.formState.errors.lastName && (
              <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
                {profileForm.formState.errors.lastName.message}
              </Text>
            )}
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
            Username
          </Text>
          <TextInput
            placeholder="@yourusername"
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              width: '100%',
              fontSize: 16,
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: profileForm.formState.errors.username ? '#fca5a5' : '#e5e7eb',
              backgroundColor: 'white',
              color: '#111827',
              height: 56,
              textAlignVertical: 'center',
            }}
            placeholderTextColor="#9CA3AF"
            {...profileForm.register("username")}
          />
          {profileForm.formState.errors.username && (
            <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
              {profileForm.formState.errors.username.message}
            </Text>
          )}
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
            Phone Number
          </Text>
          <TextInput
            placeholder="+1 234 567 8900"
            keyboardType="phone-pad"
            style={{
              width: '100%',
              fontSize: 16,
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: profileForm.formState.errors.phoneNumber ? '#fca5a5' : '#e5e7eb',
              backgroundColor: 'white',
              color: '#111827',
              height: 56,
              textAlignVertical: 'center',
            }}
            placeholderTextColor="#9CA3AF"
            {...profileForm.register("phoneNumber")}
          />
          {profileForm.formState.errors.phoneNumber && (
            <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
              {profileForm.formState.errors.phoneNumber.message}
            </Text>
          )}
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
            Birth Date
          </Text>
          <Controller
            control={profileForm.control}
            name="birthdate"
            render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
              <>
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="YYYY-MM-DD"
                  style={{
                    width: '100%',
                    fontSize: 16,
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: error ? '#fca5a5' : '#e5e7eb',
                    backgroundColor: 'white',
                    color: '#111827',
                    height: 56,
                    textAlignVertical: 'center',
                  }}
                  placeholderTextColor="#9CA3AF"
                />
                {error && (
                  <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
                    {error.message}
                  </Text>
                )}
              </>
            )}
          />
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
            Profile Picture (optional)
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ 
              width: 80, 
              height: 80, 
              backgroundColor: '#00AAEC', 
              borderRadius: 40, 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}>
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 24 }}>
                {profileForm.watch("firstName")?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={pickImage}
              style={{ 
                backgroundColor: '#00AAEC', 
                paddingVertical: 12, 
                paddingHorizontal: 24, 
                borderRadius: 12, 
                flex: 1 
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center', fontSize: 18 }}>
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
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 40
        }}
      >
        <View style={{ flex: 1, justifyContent: 'center' }}>

          {/* Header */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Svg width={56} height={56} viewBox="0 -4 48 48">
                <G stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                  <G transform="translate(-300, -164)" fill="#00AAEC">
                    <Path d="M348,168.735283 C346.236309,169.538462 344.337383,170.081618 342.345483,170.324305 C344.379644,169.076201 345.940482,167.097147 346.675823,164.739617 C344.771263,165.895269 342.666667,166.736006 340.418384,167.18671 C338.626519,165.224991 336.065504,164 333.231203,164 C327.796443,164 323.387216,168.521488 323.387216,174.097508 C323.387216,174.88913 323.471738,175.657638 323.640782,176.397255 C315.456242,175.975442 308.201444,171.959552 303.341433,165.843265 C302.493397,167.339834 302.008804,169.076201 302.008804,170.925244 C302.008804,174.426869 303.747139,177.518238 306.389857,179.329722 C304.778306,179.280607 303.256911,178.821235 301.9271,178.070061 L301.9271,178.194294 C301.9271,183.08848 305.322064,187.17082 309.8299,188.095341 C309.004402,188.33225 308.133826,188.450704 307.235077,188.450704 C306.601162,188.450704 305.981335,188.390033 305.381229,188.271578 C306.634971,192.28169 310.269414,195.2026 314.580032,195.280607 C311.210424,197.99061 306.961789,199.605634 302.349709,199.605634 C301.555203,199.605634 300.769149,199.559408 300,199.466956 C304.358514,202.327194 309.53689,204 315.095615,204 C333.211481,204 343.114633,188.615385 343.114633,175.270495 C343.114633,174.831347 343.106181,174.392199 343.089276,173.961719 C345.013559,172.537378 346.684275,170.760563 348,168.735283" />
                  </G>
                </G>
              </Svg>
            </View>
            
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
              {[1, 2, 3].map((step) => (
                <View
                  key={step}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    backgroundColor: step <= currentStep ? "#00AAEC" : "#d1d5db"
                  }}
                />
              ))}
            </View>
          </View>

          <View style={{ 
            backgroundColor: 'white', 
            borderRadius: 24, 
            padding: 32, 
            marginBottom: 32,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <View style={{ marginTop: 5 }}>
              <TouchableOpacity
                onPress={handleNext}
                disabled={!validateCurrentStep()}
                style={{
                  width: '100%',
                  paddingVertical: 16,
                  paddingHorizontal: 24,
                  borderRadius: 16,
                  backgroundColor: validateCurrentStep() ? '#00AAEC' : '#d1d5db',
                }}
              >
                <Text style={{
                  fontWeight: 'bold',
                  fontSize: 20,
                  textAlign: 'center',
                  color: validateCurrentStep() ? 'white' : '#6b7280'
                }}>
                  {currentStep === 3 ? "Create Account" : "Next"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={{ marginTop: 24 }}>
            <Text style={{ color: '#6b7280', fontSize: 16, textAlign: 'center' }}>
              Already have an account?{" "}
              <Text style={{ color: '#00AAEC', fontWeight: '500' }}>
                Sign in
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
