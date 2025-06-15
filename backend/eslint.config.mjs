import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  {
    rules: {
      "max-len": ["error", { 
        "code": 100,
        "ignoreUrls": true,
        "ignoreStrings": true,
        "ignoreTemplateLiterals": true,
        "ignoreRegExpLiterals": true,
        "ignoreComments": true
      }]
    }
  }
]);
