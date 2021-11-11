import React from 'react'
import { View, Text } from 'react-native'

import { ScreenFC } from '@berty-tech/navigation'

export const DevText: ScreenFC<'Settings.DevText'> = ({
	route: {
		params: { text },
	},
}) => {
	return (
		<View>
			<Text selectable={true} style={{ height: '95%' }}>
				{text}
			</Text>
		</View>
	)
}
