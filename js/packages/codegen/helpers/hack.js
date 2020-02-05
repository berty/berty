const Case = require('case')
module.exports.register = (handlebars) => {
	// try to match to string that are inconsistants
	handlebars.registerHelper('matchInconsistant', function(a, b) {
		if (b.replace('Outgoing', '') === a) {
			return true
		}
		if (b.replace('Incoming', '') === a) {
			return true
		}
		const _a = Case.snake(a)
		const _b = Case.snake(b)
		const _aSplited = _a.split('_')
		const _bSplited = _b.split('_')
		let ratio = _aSplited.length > _bSplited.length ? -_aSplited.length : -_bSplited.length
		_a.split('_').forEach((__a) => {
			if (Case.pascal(b).includes(Case.pascal(__a))) {
				ratio += 1
			}
		})
		if (ratio === 0) {
			return true
		}
		return false
	})
}
