import React from 'react'
import { View, Text } from 'react-native'

export const DevText: React.FC<{ route: { params: { text: string } } }> = ({
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
