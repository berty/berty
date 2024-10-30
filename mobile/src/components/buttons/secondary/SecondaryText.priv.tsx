import React from 'react'

import { useThemeColor } from '@berty/hooks'

import { TextButtonPriv } from '../TextButton.priv'

export const SecondaryTextPriv: React.FC<{ disabled: boolean }> = props => {
	const colors = useThemeColor()

	return (
		<TextButtonPriv color={props.disabled ? '#D0D0D6' : colors['background-header']}>
			{props.children}
		</TextButtonPriv>
	)
}
