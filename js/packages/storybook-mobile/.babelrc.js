module.exports = {
  presets: ['@berty-tech/babel-preset'],
  plugins: [
    ['module-resolver', {
      alias: {
        '@storybook/react': '@storybook/react-native',
      }
    }]
  ]
}
