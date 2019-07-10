module.exports = function(api) {
  api.cache(true)
  return {
    presets: ['@babel/env', '@babel/react'],
    plugins: [
      '@babel/plugin-transform-modules-commonjs',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  }
}
