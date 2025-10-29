import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig } from "eslint/config";

export default defineConfig([
  // dist 폴더 무시
  { ignores: ["dist"] },

  // JS 기본 권장 규칙
  js.configs.recommended,

  // Node 환경 파일들 (vite.config.js 등)
  {
    files: ["**/*.config.*", "vite.config.*", "eslint.config.js"],
    languageOptions: { globals: globals.node },
  },

  // React/JSX 코드용
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: "detect" } },
    rules: {
      // React 권장 Flat 설정 병합
      ...(react.configs.flat?.recommended?.rules ?? {}),
      ...(react.configs.flat?.["jsx-runtime"]?.rules ?? {}),
      ...(reactHooks.configs["recommended-latest"]?.rules ?? {}),
      ...(reactRefresh.configs.vite?.rules ?? {}),

      // 커스텀 룰
      "react/prop-types": "off", // ← propTypes 안 쓸 때
      "react/react-in-jsx-scope": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": [
        "error",
        { varsIgnorePattern: "^[A-Z_]|^_", argsIgnorePattern: "^_" },
      ],
    },
  },
]);
