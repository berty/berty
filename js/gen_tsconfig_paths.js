const alias = require('./alias')

console.log(
	JSON.stringify(
		Object.entries(alias).reduce((r, [a, k]) => ({ ...r, [a]: [k], [a + '/*']: [k + '/*'] }), {}),
	),
)
