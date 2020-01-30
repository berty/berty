module.exports.register = (handlebars) => {
	handlebars.registerHelper('lookup', function() {
		const options = arguments[arguments.length - 1]
		delete arguments[arguments.length - 1]
		return options.data.root.lookup(...arguments)
	})

	handlebars.registerHelper('lookupEnum', function() {
		const options = arguments[arguments.length - 1]
		delete arguments[arguments.length - 1]
		return options.data.root.lookupEnum(...arguments)
	})

	handlebars.registerHelper('lookupType', function() {
		const options = arguments[arguments.length - 1]
		delete arguments[arguments.length - 1]
		return options.data.root.lookupType(...arguments)
	})

	handlebars.registerHelper('lookupTypeOrEnum', function() {
		const options = arguments[arguments.length - 1]
		delete arguments[arguments.length - 1]
		return options.data.root.lookupTypeOrEnum(...arguments)
	})

	handlebars.registerHelper('lookupService', function() {
		const options = arguments[arguments.length - 1]
		delete arguments[arguments.length - 1]
		return options.data.root.lookupService(...arguments)
	})

	handlebars.registerHelper('typeof', function(context) {
		if (typeof context === 'object' && context != null) {
			return context.constructor.name
		}
		return typeof context
	})

	handlebars.registerHelper('root', function(options) {
		return options.data.root
	})

	function namespace(context, options) {
		return (context.parent ? namespace(context.parent, options) + '.' : '') + context.name
	}
	handlebars.registerHelper('namespace', namespace)

	handlebars.registerHelper('inamespace', function(context, options) {
		return (context.parent ? namespace(context.parent, options) + '.' : '') + 'I' + context.name
	})

	handlebars.registerHelper('importPaths', function(options) {
		const importPaths = []
		for (const path of options.data.root.files) {
			importPaths.push(options.data.root.resolvePath('.', path))
		}
		return importPaths
	})

	handlebars.registerHelper('convertScalarType', function(scalarType) {
		switch (scalarType) {
			case ('int32', 'int64', 'sint32', 'sint64', 'sfixed32', 'sfixed64'):
			case ('uint32', 'uint64', 'fixed32', 'fixed64'):
			case ('double', 'float'):
				return 'number'
			case 'bytes':
				return 'Uint8Array'
			case 'bool':
				return 'boolean'
			case 'string':
				return 'string'
			default:
				return undefined
		}
	})
}
