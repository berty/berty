module.exports = {
	root: true,
	extends: ['@react-native-community', 'plugin:import/errors'],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'import'],
	rules: {
		semi: [2, 'never'],
		'react-native/no-inline-styles': 0,
		'jsx-quotes': [2, 'prefer-single'],
		'no-shadow': 0,
		'no-catch-shadow': 0,
		'no-mixed-spaces-and-tabs': [2, 'smart-tabs'],
		'import/no-unresolved': 0,
		'import/namespace': 0,
		'import/named': 0,
		'import/order': [
			2,
			{
				groups: ['builtin', 'external', 'internal'],
				pathGroups: [
					{
						pattern: 'react',
						group: 'builtin',
						position: 'before',
					},
					{
						pattern: '@berty-tech/**',
						group: 'internal',
						position: 'after',
					},
				],
				pathGroupsExcludedImportTypes: ['react'],
				'newlines-between': 'always',
				alphabetize: {
					order: 'asc',
					caseInsensitive: true,
				},
			},
		],
	},
	globals: {
		JSX: 'readonly',
	},
}
