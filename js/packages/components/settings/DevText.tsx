import React from 'react'
import { Text, ScrollView } from 'react-native'

import { ScreenFC } from '@berty/navigation'

export const DevText: ScreenFC<'Settings.DevText'> = ({
	route: {
		params: { text },
	},
}) => {
	return (
		<ScrollView>
			<Text selectable={true}>{text}</Text>
		</ScrollView>
	)
}
