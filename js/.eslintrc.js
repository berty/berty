module.exports = {
	root: true,
	extends: '@react-native-community',
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	rules: {
		semi: [2, 'never'],
		'react-native/no-inline-styles': 0,
		'jsx-quotes': [2, 'prefer-single'],
		'no-shadow': 0,
		'no-catch-shadow': 0,
		'no-mixed-spaces-and-tabs': [2, 'smart-tabs'],
	},
	globals: {
		JSX: 'readonly',
	},
}
