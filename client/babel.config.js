module.exports = function(api) {
  api.cache(true)
  return {
    exclude: ['**/*.png', '**/*.jpg', '**/*.gif'],
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: ['last 2 versions', 'safari >= 7'],
          },
          debug: true,
          loose: true,
          sourceType: 'script',
        },
      ],
      '@babel/preset-react',
      'module:metro-react-native-babel-preset',
    ],
    plugins: [
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-optional-chaining',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-transform-runtime',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-transform-modules-commonjs',
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  }
}
