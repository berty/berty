import React from 'react'

import { TextButtonPriv } from '../TextButton.priv'

export const TertiaryTextPriv: React.FC = props => {
	// TODO: replace with value from theme
	return <TextButtonPriv color='#D2D3E1'>{props.children}</TextButtonPriv>
}
