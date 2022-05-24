import React from 'react'

import { ButtonPressProps } from '../../interfaces'
import { FloatingButtonPriv } from '../FloatingButton.priv'

export const SecondaryFloatingButton: React.FC<ButtonPressProps> = props => {
	// TODO: replace with value from theme
	return <FloatingButtonPriv backgroundColor='#EAEAFB' onPress={props.onPress} />
}
