var Case = require('case')

module.exports.register = (handlebars) => {
  handlebars.registerHelper('case', function() {
    return Case[arguments[0]](arguments[1])
  })
}
