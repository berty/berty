import React from 'react'

import { TextButtonPriv } from '../TextButton.priv'

export const TertiaryTextPriv: React.FC<{ disabled: boolean; alternative?: boolean }> = props => {
	// TODO: replace with value from theme
	const getColor = (): string => {
		if (props.disabled) {
			return props.alternative ? 'rgba(210, 211, 225, 0.5)' : '#D0D0D6'
		}
		return '#D2D3E1'
	}

	return <TextButtonPriv color={getColor()}>{props.children}</TextButtonPriv>
}
