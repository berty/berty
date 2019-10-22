module.exports.register = (handlebars) => {
  // permit to lookup at package, message, enum ...
  // ex: {{lookup 'google.protobuf.Timestamp'}}
  // see https://github.com/protobufjs/protobuf.js/blob/69623a91c1e4a99d5210b5295a9e5b39d9517554/index.d.ts#L79://github.com/protobufjs/protobuf.js/blob/69623a91c1e4a99d5210b5295a9e5b39d9517554/index.d.ts#L793
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

  handlebars.registerHelper('namespace', function namespace(context, options) {
    return (
      (context.parent ? namespace(context.parent, options) + '.' : '') +
      context.name
    )
  })

  handlebars.registerHelper('importPaths', function(options) {
    const importPaths = []
    for (const path of options.data.root.files) {
      importPaths.push(options.data.root.resolvePath('.', path))
    }
    return importPaths
  })
}
