import React from 'react'

export const useToggle = (initialValue?: boolean) => {
	const [isToggleOn, setIsToggleOn] = React.useState(false)

	React.useEffect(() => {
		const propsToggleOn = initialValue || false

		if (isToggleOn !== propsToggleOn) {
			setIsToggleOn(propsToggleOn)
		}
	}, [initialValue, isToggleOn])

	return isToggleOn
}
