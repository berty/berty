module.exports = (api) => {
	api.cache(true)
	return {
		presets: ['@berty-tech/babel-preset'],
	}
}
