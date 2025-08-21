import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import SignUpPage from "./screens/sign-up-page";

export default function SignUpScreen() {
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
      <SignUpPage
        currentStep={currentStep}
        setCurrentStep={(step) => setCurrentStep(step)}
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
}