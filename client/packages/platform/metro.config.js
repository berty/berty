const fs = require('fs')
const path = require('path')
const getDevPaths = require('get-dev-paths')
const blacklist = require('metro-config/src/defaults/blacklist')

const projectRoot = __dirname
const modules = getDevPaths(projectRoot).map($ => fs.realpathSync($))

const blacklisted = modules.map(
  module => new RegExp(`${module}/node_modules/react-native/.*`)
)

module.exports = {
  maxWorkers: 2,
  watchFolders: Array.from(new Set(modules)),

  resolver: {
    extraNodeModules: {
      'react-native': path.resolve(
        projectRoot,
        '../../node_modules/react-native'
      ),
      'node-libs-browser': require('node-libs-react-native/globals'),
    },
    blacklistRE: blacklist(blacklisted),
    providesModuleNodeModules: [
      path.resolve(projectRoot, '../../node_modules'),
    ],
  },
}
