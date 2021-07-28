import React from 'react'
import { View } from 'react-native'
import { Text } from '@ui-kitten/components'

import { useThemeColor } from '@berty-tech/store/hooks'

export const UnreadCount: React.FC<{ value: number; isConvBadge?: boolean }> = ({
	value,
	isConvBadge = false,
}) => {
	const colors = useThemeColor()
	const dimension = isConvBadge ? 15 : 21
	const fontSize = isConvBadge ? 10 : 13
	const lineHeight = isConvBadge ? 14 : 17

	return value ? (
		<View
			style={{
				backgroundColor: colors['warning-asset'],
				justifyContent: 'center',
				borderRadius: 1000,
				height: dimension,
				minWidth: dimension,
				paddingHorizontal: 2,
			}}
		>
			<Text
				style={{
					color: colors['reverted-main-text'],
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
