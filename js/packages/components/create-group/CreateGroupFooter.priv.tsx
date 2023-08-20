import React from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

export const CreateGroupFooterPriv: React.FC = props => {
	const { padding, margin } = useStyles()

	return (
		<View
			style={[
				padding.horizontal.huge,
				padding.vertical.large,
				margin.bottom.small,
				{ backgroundColor: '#FFFFFF' },
			]}
		>
			{props.children}
		</View>
	)
}
