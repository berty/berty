import React from 'react'

import { useThemeColor } from '@berty/store'

import { ToggleProps } from './interfaces'
import { TogglePriv } from './Toggle.priv'

export const AltToggle: React.FC<ToggleProps> = props => {
	const colors = useThemeColor()

	return (
		<TogglePriv
			{...props}
			styleColors={{
				circleBackground: colors['background-header'],
				toggleBackgroundInactive: '#DEE2E8',
				toggleBackgroundActive: colors['input-background'],
			}}
		/>
	)
}
