module.exports = {
	root: true,
	extends: ['@react-native-community'],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'import'],
	rules: {
		semi: [2, 'never'],
		'react-native/no-inline-styles': 0,
		'jsx-quotes': [2, 'prefer-single'],
		'no-shadow': 0,
		'no-catch-shadow': 0,
		'no-mixed-spaces-and-tabs': [2, 'smart-tabs'],
		// no-spaced-func breaks on typescript and already handled by prettier
		'no-spaced-func': 0,
		'react/react-in-jsx-scope': 2,
		'import/order': [
			2,
			{
				groups: [
					['builtin', 'external'],
					'internal',
					['sibling', 'parent', 'index'],
					'object',
					'type',
				],
				pathGroups: [
					{
						pattern: '@berty/**',
						group: 'internal',
						position: 'before',
					},
				],
				// https://github.com/import-js/eslint-plugin-import/issues/2291#issuecomment-1050199872
				pathGroupsExcludedImportTypes: [],
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
