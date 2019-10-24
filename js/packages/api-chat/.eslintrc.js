module.exports = {
  extends: [
    "@berty-tech/eslint-config",
  ],
  globals: {
    proto: 'readonly',
    COMPILED: 'readonly',
  },
  overrides: [
    {
      files: ['*.ts'],
      rules: {
				'@typescript-eslint/no-empty-interface': [0],
        '@typescript-eslint/no-unused-vars': [0],
        '@typescript-eslint/no-explicit-any': [0],
      },
    }
  ]
}
