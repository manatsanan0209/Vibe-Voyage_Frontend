import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(
    { ignores: ['dist'] },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            prettierConfig,
        ],
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            'unused-imports': unusedImports,
            prettier,
            react,
            import: importPlugin,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            'prettier/prettier': [
                'warn',
                {
                    endOfLine: 'auto',
                },
            ],
            semi: ['warn', 'always'],
            'arrow-body-style': ['warn', 'as-needed'],
            'react/jsx-curly-brace-presence': [
                'error',
                { props: 'never', children: 'never' },
            ],
            'unused-imports/no-unused-imports': 'warn',
            'padding-line-between-statements': [
                'warn',
                { blankLine: 'always', prev: '*', next: 'return' },
            ],
            'import/order': [
                'warn',
                {
                    groups: [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                    ],
                    'newlines-between': 'never',
                },
            ],
            'padding-line-between-statements': [
                'warn',
                { blankLine: 'always', prev: 'import', next: '*' },
                { blankLine: 'never', prev: 'import', next: 'import' },
            ],
        },
    },
);
