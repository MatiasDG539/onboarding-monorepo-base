import { Stack } from "expo-router";
import VerifyEmailScreen from "./screens/verify-email";

export default function VerifyEmailRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "Verify Email",
          headerBackVisible: true,
        }}
      />
      <VerifyEmailScreen />
    </>
  );
}
