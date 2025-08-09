// ESLint flat config for Nuxt 3 + TypeScript + Vue 3
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import prettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // Ignore build artifacts
  {
    ignores: [
      'node_modules/**',
      '.nuxt/**',
      'dist/**',
      '.output/**',
      '.vercel/**',
      'coverage/**',
      'public/**',
      'functions/**/.wrangler/**'
    ]
  },

  // Base JS rules
  js.configs.recommended,

  // TypeScript rules
  ...tseslint.configs.recommended,

  // Vue rules (flat config)
  ...pluginVue.configs['flat/recommended'],

  // Disable rules that conflict with Prettier
  prettier,

  // Common project rules
  {
    files: ['**/*.{js,jsx,ts,tsx,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Vue Composition API (commonly auto-imported in Nuxt)
        ref: 'readonly',
        computed: 'readonly',
        reactive: 'readonly',
        watch: 'readonly',
        watchEffect: 'readonly',
        onMounted: 'readonly',
        onUpdated: 'readonly',
        onUnmounted: 'readonly',
        onBeforeMount: 'readonly',
        onBeforeUpdate: 'readonly',
        onBeforeUnmount: 'readonly',
        nextTick: 'readonly',

        // Nuxt 3 auto-imports
        useRoute: 'readonly',
        useRouter: 'readonly',
        useHead: 'readonly',
        navigateTo: 'readonly',
        useRuntimeConfig: 'readonly',
        defineNuxtPlugin: 'readonly',
        defineNuxtRouteMiddleware: 'readonly',
        definePageMeta: 'readonly',

        // SFC macros
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',

        // Project composables auto-imported by Nuxt (from ./composables)
        useFavorites: 'readonly',
        useOnVisible: 'readonly',
        usePlayerData: 'readonly',
        useQuerySync: 'readonly',
        useRankingQuery: 'readonly',
        useRecent: 'readonly',
        useSwipe: 'readonly',
        useToast: 'readonly'
      }
    },
    rules: {
      // Nuxtでは単語1つのコンポーネント名がありうる
      'vue/multi-word-component-names': 'off',
      // Nuxtの自動インポートを使うため no-undef は無効化
      'no-undef': 'off',
      // まずは導入優先で any の厳格さは下げる
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  },

  // Ensure .vue SFCs parse with Vue parser + TS inside <script>
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue']
      }
    }
  },

  // Plain TS/JS files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    }
  }
];


