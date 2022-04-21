import React from 'react'
import { View } from 'react-native'
import { Icon } from '@ui-kitten/components'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store/hooks'
import { UnifiedText } from '../shared-components/UnifiedText'

export const ImageCounter: React.FC<{ count: number }> = ({ count }) => {
	const { border, padding } = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				{
					flexDirection: 'row',
					backgroundColor: colors['background-header'],
					alignItems: 'center',
					justifyContent: 'center',
				},
				padding.small,
				border.radius.large,
			]}
		>
			<Icon name='plus' width={22} height={22} fill={colors['reverted-main-text']} />
			<UnifiedText
				style={{
					color: colors['reverted-main-text'],
					fontSize: 18,
				}}
			>
				{count}
			</UnifiedText>
		</View>
	)
}
