import React from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

export const CreateGroupFooterPriv: React.FC = props => {
	const { padding, margin } = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				padding.horizontal.huge,
				padding.vertical.large,
				margin.bottom.small,
				{ backgroundColor: colors['main-background'] },
			]}
		>
			{props.children}
		</View>
	)
}
