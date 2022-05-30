import React from 'react'

import { ButtonDefProps } from '../../interfaces'
import { FloatingButtonPriv } from '../FloatingButton.priv'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SecondaryFloatingButton: React.FC<ButtonDefProps> = props => {
	// TODO: replace with value from theme
	return <FloatingButtonPriv {...props} style={{ backgroundColor: '#EAEAFB' }} />
}
