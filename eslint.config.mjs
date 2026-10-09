// @ts-check
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import withNuxt from './.nuxt/eslint.config.mjs'

const vueA11yRecommendedRules = pluginVueA11y.configs['flat/recommended']
  .reduce((rules, config) => ({ ...rules, ...config.rules }), {})

export default withNuxt(
  {
    name: 'kwvr/accessibility',
    files: ['**/*.vue'],
    plugins: { 'vuejs-accessibility': pluginVueA11y },
    rules: {
      ...vueA11yRecommendedRules,
      // A <label> wrapping USelect, UInputTime or a <button> labels that control
      // (see TimetableSearchForm and TimetableDepartureDatePicker)
      'vuejs-accessibility/label-has-for': ['error', { controlComponents: ['USelect', 'UInputTime', 'button'] }],
    },
  },
  {
    name: 'kwvr/style',
    rules: {
      'prefer-arrow-callback': 'error',
      'func-style': ['error', 'expression'],
      'max-lines': ['warn', { max: 250, skipBlankLines: true, skipComments: true }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    name: 'kwvr/typescript',
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    name: 'kwvr/vue',
    files: ['**/*.vue'],
    rules: {
      'vue/component-name-in-template-casing': ['error', 'PascalCase', { registeredComponentsOnly: false }],
      'vue/multi-word-component-names': 'off',
    },
  },
)
