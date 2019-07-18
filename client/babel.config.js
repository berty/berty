module.exports = function(api) {
  api.cache(true)
  return {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['last 2 versions', 'safari >= 7'],
          },
          // useBuiltIns: 'entry',
          debug: true,
          loose: true,
        },
      ],
      '@babel/preset-react',
      '@babel/preset-flow',
      'module:metro-react-native-babel-preset',
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      [
        '@babel/plugin-transform-runtime',
        {
          absoluteRuntime: true,
        },
      ],
      '@babel/plugin-syntax-dynamic-import',
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  }
}
