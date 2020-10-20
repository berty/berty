const fs = require('fs')
const path = require('path')

const pkgsRoot = path.join(__dirname, 'packages')
const pkgPrefix = '@berty-tech'

const pkgs = fs.readdirSync(pkgsRoot)

module.exports = pkgs.reduce(
	(alias, name) => ({
		...alias,
		[path.join(pkgPrefix, name)]: './' + path.relative(__dirname, path.join(pkgsRoot, name)),
	}),
	{},
)
