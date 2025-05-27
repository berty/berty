const getRandomColor = () => {
	const letters = '0123456789ABCDEF'
	let color = '#'
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)]
	}
	return color
}

export const randomizeThemeColor = () => {
	return {
		'main-text': getRandomColor(),
		'main-background': getRandomColor(),
		'secondary-background': getRandomColor(),
		'secondary-text': getRandomColor(),
		'background-header': getRandomColor(),
		'secondary-background-header': getRandomColor(),
		'alt-secondary-background-header': getRandomColor(),
		'reverted-main-text': getRandomColor(),
		'positive-asset': getRandomColor(),
		'negative-asset': getRandomColor(),
		'warning-asset': getRandomColor(),
		'input-background': getRandomColor(),
		shadow: getRandomColor(),
	}
}
