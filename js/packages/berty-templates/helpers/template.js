module.exports.register = (handlebars) => {
	const templates = {}

	handlebars.registerHelper('declare', function(name, options) {
		if (templates[name] != null) {
			return
		}
		templates[name] = options.fn
	})
	handlebars.registerHelper('call', function(name, data) {
		if (templates[name] != null) {
			return templates[name](data)
		}
		throw new Error('template with name ' + name + ' is not declared')
	})
}
