import React from 'react'

import { ButtonDefProps } from '../../interfaces'
import { FloatingButtonPriv } from '../FloatingButton.priv'

export const SecondaryFloatingButton: React.FC<ButtonDefProps> = props => {
	// TODO: replace with value from theme
	return <FloatingButtonPriv {...props} style={{ backgroundColor: '#EAEAFB' }} />
}
