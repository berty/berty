import React from 'react'
import { View } from 'react-native'

import { Text, Icon } from '@ui-kitten/components'
import { useStyles } from '@berty-tech/styles'

export const ImageCounter: React.FC<{ count: number }> = ({ count }) => {
	const [{ color, border, padding }] = useStyles()

	return (
		<View
			style={[
				{
					flexDirection: 'row',
					backgroundColor: '#4F58C0',
					alignItems: 'center',
					justifyContent: 'center',
				},
				padding.small,
				border.radius.large,
			]}
		>
			<Icon name='plus' width={22} height={22} fill={color.white} style={[]} />
			<Text
				style={{
					color: color.white,
					fontSize: 18,
				}}
			>
				{count}
			</Text>
		</View>
	)
}
