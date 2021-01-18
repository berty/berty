import React from 'react'
import { View } from 'react-native'
import { Text } from '@ui-kitten/components'

export const UnreadCount: React.FC<{ value: number; isConvBadge?: boolean }> = ({
	value,
	isConvBadge = false,
}) => {
	const dimension = isConvBadge ? 15 : 21
	const fontSize = isConvBadge ? 10 : 13
	const lineHeight = isConvBadge ? 14 : 17

	return value ? (
		<View
			style={{
				backgroundColor: 'red',
				justifyContent: 'center',
				borderRadius: 1000,
				height: dimension,
				minWidth: dimension,
				paddingHorizontal: 2,
			}}
		>
			<Text
				style={{
					color: 'white',
					fontWeight: '700',
					textAlign: 'center',
					fontSize,
					lineHeight,
				}}
			>
				{value.toString()}
			</Text>
		</View>
	) : null
}
