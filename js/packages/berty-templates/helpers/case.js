var Case = require('case')

module.exports.register = (handlebars) => {
	handlebars.registerHelper('case', function() {
		if (arguments.length > 3) {
			return Case[arguments[0]](arguments[2], arguments[1])
		}
		return Case[arguments[0]](arguments[1])
	})
}
