module.exports.register = (handlebars) =>
	handlebars.registerHelper('JSONprettify', function(context) {
		return JSON.stringify(context, null, 2)
	})
