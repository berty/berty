import React from 'react'

import { useThemeColor } from '@berty/store'

import { ButtonPressProps } from '../../interfaces'
import { FloatingButtonPriv } from '../FloatingButton.priv'

export const PrimaryFloatingButton: React.FC<ButtonPressProps> = props => {
	const colors = useThemeColor()

	return (
		<FloatingButtonPriv backgroundColor={colors['background-header']} onPress={props.onPress} />
	)
}
