const path = require('path')

module.exports = {
	process(src, filename) {
		return 'module.exports = ' + JSON.stringify(path.basename(filename)) + ';'
	},
}

// see https://github.com/react-navigation/react-navigation/issues/8669 and https://github.com/facebook/jest/issues/2663#issuecomment-317109798
