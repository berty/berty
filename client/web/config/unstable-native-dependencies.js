var reactdomUnstable = require('../node_modules/react-dom/unstable-native-dependencies')
var reactdom = require('../node_modules/react-dom')

if (process.env.NODE_ENV !== 'production') {
  reactdomUnstable.injectEventPluginsByName =
    reactdom.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.Events.injectEventPluginsByName
}

module.exports = reactdomUnstable
