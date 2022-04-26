import React from 'react'
import { View } from 'react-native'

import { useThemeColor } from '@berty/store/hooks'
import { useStyles } from '@berty/contexts/styles'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

export const UnreadCount: React.FC<{ value: number; isConvBadge?: boolean }> = ({
	value,
	isConvBadge = false,
}) => {
	const { text } = useStyles()
	const { scaleSize } = useAppDimensions()
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
			<UnifiedText
				style={[
					text.bold,
					{
						color: colors['reverted-main-text'],
						textAlign: 'center',
						fontSize: fontSize * scaleSize,
						lineHeight: lineHeight * scaleSize,
					},
				]}
			>
				{value.toString()}
			</UnifiedText>
		</View>
	) : null
}
