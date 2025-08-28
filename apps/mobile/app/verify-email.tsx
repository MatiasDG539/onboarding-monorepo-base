import { Stack } from "expo-router";
import VerifyEmailScreen from "./screens/verify-email";

const VerifyEmailRoute = () => (
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

export default VerifyEmailRoute;
