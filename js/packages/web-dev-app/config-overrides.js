const { aliasDangerous, aliasJest, configPaths } = require('react-app-rewire-alias/lib/aliasDangerous')

const aliasMap = configPaths('./tsconfig.paths.json')

module.exports = aliasDangerous(aliasMap)
module.exports.jest = aliasJest(aliasMap)

