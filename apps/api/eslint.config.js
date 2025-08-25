import { config as base } from "@repo/eslint-config/base";

export default [
  ...base,
  {
    ignores: ["dist/**", ".next/**", "node_modules/**"],
  },
];
