// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // Vue 3 fully supports multi-root templates (fragments) — this rule only
    // makes sense for Vue 2 compatibility, which this project doesn't need.
    'vue/no-multiple-template-root': 'off',
  },
})
