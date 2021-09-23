import React from 'react'
import { View } from 'react-native'
import { Text } from '@ui-kitten/components'

import { useThemeColor } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'

export const UnreadCount: React.FC<{ value: number; isConvBadge?: boolean }> = ({
	value,
	isConvBadge = false,
}) => {
	const [{}, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const dimension = isConvBadge ? 15 : 18
	const fontSize = isConvBadge ? 10 : 13
	const lineHeight = isConvBadge ? 14 : 17

	return value ? (
		<View
			style={{
				backgroundColor: colors['warning-asset'],
				justifyContent: 'center',
				borderRadius: 1000,
				height: dimension * scaleSize,
				minWidth: dimension * scaleSize,
				paddingHorizontal: 2 * scaleSize,
			}}
		>
			<Text
				style={{
					color: colors['reverted-main-text'],
					fontWeight: '700',
					textAlign: 'center',
					fontSize: fontSize * scaleSize,
					lineHeight: lineHeight * scaleSize,
				}}
			>
				{value.toString()}
			</Text>
		</View>
	) : null
}
