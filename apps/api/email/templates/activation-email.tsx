import { Html } from "@react-email/components";
import * as React from "react";

interface ActivationEmailProps {
  code: string;
}

export const ActivationEmail = ({ code }: ActivationEmailProps): JSX.Element => {
  return (
    <Html lang="es">
      <h1>Bienvenido 👋</h1>
      <p>Tu código de activación es:</p>
      <h2 style={{ letterSpacing: "4px" }}>{code}</h2>
    </Html>
  );
};
