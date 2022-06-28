import React from 'react'

import { useThemeColor } from '@berty/hooks'

import { ToggleProps } from './interfaces'
import { TogglePriv } from './Toggle.priv'

export const Toggle: React.FC<ToggleProps> = props => {
	const colors = useThemeColor()

	return (
		<TogglePriv
			{...props}
			styleColors={{
				circleBackground: 'white',
				toggleBackgroundInactive: '#EDF0F3',
				toggleBackgroundActive: colors['background-header'],
			}}
		/>
	)
}
