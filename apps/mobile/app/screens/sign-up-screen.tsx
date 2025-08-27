import React, { useState, useEffect } from 'react';
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
import { useNavigation } from 'expo-router';

interface FormData {
  emailOrPhone: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  username: string;
  phoneNumber: string;
  birthdate: string;
  profilePicture: string | null;
}

interface ValidationErrors {
  emailOrPhone?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phoneNumber?: string;
  birthdate?: string;
}

interface SignUpPageProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onBack?: () => void;
}

export default function SignUpPage({ currentStep, setCurrentStep, onBack }: SignUpPageProps) {
  const [useEmail, setUseEmail] = useState(true);
  
  const [formData, setFormData] = useState<FormData>({
    emailOrPhone: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
    phoneNumber: "",
    birthdate: "",
    profilePicture: null,
  });

  const navigation = useNavigation();

  const [errors, setErrors] = useState<ValidationErrors>({});

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Phone validation regex
  const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;

  // Username validation (alphanumeric + underscore, 3-20 chars)
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

   useEffect(() => {
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

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "emailOrPhone":
        if (!value.trim()) return "This field is required";
        if (useEmail) {
          if (!emailRegex.test(value)) return "Please enter a valid email";
        } else {
          if (!phoneRegex.test(value)) return "Please enter a valid phone number";
        }
        break;
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          return "Password must contain at least one uppercase, one lowercase and one number";
        }
        break;
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        break;
      case "firstName":
        if (!value.trim()) return "First name is required";
        if (value.trim().length < 2) return "First name must be at least 2 characters";
        break;
      case "lastName":
        if (!value.trim()) return "Last name is required";
        if (value.trim().length < 2) return "Last name must be at least 2 characters";
        break;
      case "username":
        if (!value.trim()) return "Username is required";
        if (!usernameRegex.test(value)) {
          return "Username must be 3-20 characters (letters, numbers and _)";
        }
        break;
      case "phoneNumber":
        if (!value.trim()) return "Phone number is required";
        if (!phoneRegex.test(value)) return "Please enter a valid phone number";
        break;
      case "birthdate": {
        if (!value) return "Birth date is required";
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 13) return "You must be at least 13 years old";
        if (age > 120) return "Please enter a valid birth date";
        break;
      }
    }
    return undefined;
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const pickImage = async () => {
    Alert.alert(
      "Select Image", 
      "This functionality will be available soon.",
      [{ text: "OK" }]
    );
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      const emailOrPhoneError = validateField("emailOrPhone", formData.emailOrPhone);
      return !emailOrPhoneError;
    } else if (currentStep === 2) {
      const passwordError = validateField("password", formData.password);
      const confirmPasswordError = validateField("confirmPassword", formData.confirmPassword);
      return !passwordError && !confirmPasswordError;
    } else if (currentStep === 3) {
      const firstNameError = validateField("firstName", formData.firstName);
      const lastNameError = validateField("lastName", formData.lastName);
      const usernameError = validateField("username", formData.username);
      const phoneError = validateField("phoneNumber", formData.phoneNumber);
      const birthdateError = validateField("birthdate", formData.birthdate);
      
      return !firstNameError && !lastNameError && !usernameError && !phoneError && !birthdateError;
    }
    return false;
  };

  const handleNext = () => {
    const isValid = validateCurrentStep();
    if (isValid) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
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
            value={formData.emailOrPhone}
            onChangeText={(text) => handleInputChange("emailOrPhone", text)}
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
              borderColor: errors.emailOrPhone ? '#fca5a5' : '#e5e7eb',
              backgroundColor: 'white',
              color: '#111827',
              height: 56,
              textAlignVertical: 'center',
            }}
            placeholderTextColor="#9CA3AF"
          />
          {errors.emailOrPhone && (
            <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
              {errors.emailOrPhone}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => {
            setUseEmail(!useEmail);
            handleInputChange("emailOrPhone", "");
            setErrors(prev => ({ ...prev, emailOrPhone: undefined }));
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
            value={formData.password}
            onChangeText={(text) => handleInputChange("password", text)}
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
              borderColor: errors.password ? '#fca5a5' : '#e5e7eb',
              backgroundColor: 'white',
              color: '#111827',
              height: 56,
              textAlignVertical: 'center',
            }}
            placeholderTextColor="#9CA3AF"
          />
          {errors.password && (
            <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
              {errors.password}
            </Text>
          )}
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
            Confirm Password
          </Text>
          <TextInput
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange("confirmPassword", text)}
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
              borderColor: errors.confirmPassword ? '#fca5a5' : '#e5e7eb',
              backgroundColor: 'white',
              color: '#111827',
              height: 56,
              textAlignVertical: 'center',
            }}
            placeholderTextColor="#9CA3AF"
          />
          {errors.confirmPassword && (
            <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
              {errors.confirmPassword}
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
              value={formData.firstName}
              onChangeText={(text) => handleInputChange("firstName", text)}
              placeholder="Your first name"
              autoCapitalize="words"
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: errors.firstName ? '#fca5a5' : '#e5e7eb',
                backgroundColor: 'white',
                color: '#111827',
                height: 56,
                textAlignVertical: 'center',
              }}
              placeholderTextColor="#9CA3AF"
            />
            {errors.firstName && (
              <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
                {errors.firstName}
              </Text>
            )}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
              Last Name
            </Text>
            <TextInput
              value={formData.lastName}
              onChangeText={(text) => handleInputChange("lastName", text)}
              placeholder="Your last name"
              autoCapitalize="words"
              style={{
                flex: 1,
                fontSize: 16,
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: errors.lastName ? '#fca5a5' : '#e5e7eb',
                backgroundColor: 'white',
                color: '#111827',
                height: 56,
                textAlignVertical: 'center',
              }}
              placeholderTextColor="#9CA3AF"
            />
            {errors.lastName && (
              <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
                {errors.lastName}
              </Text>
            )}
          </View>
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
            Username
          </Text>
          <TextInput
            value={formData.username}
            onChangeText={(text) => handleInputChange("username", text)}
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
              borderColor: errors.username ? '#fca5a5' : '#e5e7eb',
              backgroundColor: 'white',
              color: '#111827',
              height: 56,
              textAlignVertical: 'center',
            }}
            placeholderTextColor="#9CA3AF"
          />
          {errors.username && (
            <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
              {errors.username}
            </Text>
          )}
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
            Phone Number
          </Text>
          <TextInput
            value={formData.phoneNumber}
            onChangeText={(text) => handleInputChange("phoneNumber", text)}
            placeholder="+1 234 567 8900"
            keyboardType="phone-pad"
            style={{
              width: '100%',
              fontSize: 16,
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: errors.phoneNumber ? '#fca5a5' : '#e5e7eb',
              backgroundColor: 'white',
              color: '#111827',
              height: 56,
              textAlignVertical: 'center',
            }}
            placeholderTextColor="#9CA3AF"
          />
          {errors.phoneNumber && (
            <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
              {errors.phoneNumber}
            </Text>
          )}
        </View>

        <View style={{ marginTop: 24 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#374151', marginBottom: 12 }}>
            Birth Date
          </Text>
          <TextInput
            value={formData.birthdate}
            onChangeText={(text) => handleInputChange("birthdate", text)}
            placeholder="YYYY-MM-DD"
            style={{
              width: '100%',
              fontSize: 16,
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: errors.birthdate ? '#fca5a5' : '#e5e7eb',
              backgroundColor: 'white',
              color: '#111827',
              height: 56,
              textAlignVertical: 'center',
            }}
            placeholderTextColor="#9CA3AF"
          />
          {errors.birthdate && (
            <Text style={{ marginTop: 8, fontSize: 14, color: '#dc2626' }}>
              {errors.birthdate}
            </Text>
          )}
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
                {formData.firstName.charAt(0).toUpperCase() || "?"}
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

          {/* Form Container */}
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

            {/* Navigation Buttons */}
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
