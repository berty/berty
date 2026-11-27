import React from 'react'

import { useIsDarkTheme, useThemeColor } from '@berty/hooks'

import { ToggleProps } from './interfaces'
import { TogglePriv } from './Toggle.priv'

export const Toggle: React.FC<ToggleProps> = props => {
	const colors = useThemeColor()
	const isDark = useIsDarkTheme()

	return (
		<TogglePriv
			{...props}
			styleColors={{
				circleBackground: 'white',
				toggleBackgroundInactive: isDark ? colors['input-background'] : '#EDF0F3',
				toggleBackgroundActive: colors['background-header'],
			}}
		/>
	)
}
