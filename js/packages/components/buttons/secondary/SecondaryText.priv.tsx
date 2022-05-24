import React from 'react'

import { useThemeColor } from '@berty/store'

import { TextButtonPriv } from '../TextButton.priv'

export const SecondaryTextPriv: React.FC = props => {
	const colors = useThemeColor()

	return <TextButtonPriv color={colors['background-header']}>{props.children}</TextButtonPriv>
}
