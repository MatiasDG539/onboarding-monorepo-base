import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import SignUpScreen from "./screens/sign-up-screen";

const SignUp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: currentStep === 1 ? "Sign Up" : `Step ${currentStep}`,
          headerBackVisible: false,
        }}
      />

      <SignUpScreen
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onBack={() => {
          if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
          } else {
            router.back();
          }
        }}
      />
    </>
  );
};

export default SignUp;