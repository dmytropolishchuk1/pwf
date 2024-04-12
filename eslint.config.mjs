import globals from 'globals'
import pluginReactConfig from 'eslint-plugin-react/configs/recommended.js'


import path from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import pluginJs from '@eslint/js'
import eslintPluginImport from 'eslint-plugin-import';

// Define your ESLint configuration
const eslintConfig = {
  // Your ESLint rules and configurations here
  plugins: ['import'],
  rules: {
    // Specify rules provided by the 'import' plugin
    'import/no-unresolved': 'error',
    // Add more rules as needed
  },
};


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({ baseDirectory: __dirname, recommendedConfig: pluginJs.configs.recommended })

export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  ...compat.extends('standard'),
  pluginReactConfig
]
