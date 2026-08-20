import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Project backup/archive folders — never lint archived source copies.
    "giftcard-backups/**",
    "homepage-backups/**",
    "image-fix-backup-*/**",
    "**/*.backup.tsx",
    "**/*.backup.ts",
  ]),
]);

export default eslintConfig;
