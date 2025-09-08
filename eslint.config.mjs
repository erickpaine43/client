import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = defineConfig([
  // Global ignores
  globalIgnores([
    "**/node_modules/",
    ".git/",
    ".next/",
    "out/",
    "build/",
    "dist/",
    "public/",
    ".vscode/",
    ".idea/",
    "*.log",
    "next-env.d.ts",
    ".open-next/",
    ".wrangler/",
    ".eslintcache",
    "tsconfig.json",
    "jsconfig.json",
    "*.lock",
    "package.json",
    "*.yml",
    "jest.setup.js"
  ]),
  // Next.js and TypeScript configuration
  {
    name: "next-typescript-config",
    files: ["**/*.{js,jsx,ts,tsx}"],
    extends: [
      ...compat.config({
        extends: ["next", "next/typescript", "prettier"],
      }),
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      // Additional best practice rules
      "@/prefer-const": "error",
      "@typescript-eslint/no-var-requires": "error",
    },
    linterOptions: {
      reportUnusedDisableDirectives: "warn",
    },
  },
]);

export default eslintConfig;
