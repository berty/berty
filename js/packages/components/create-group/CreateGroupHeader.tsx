import React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

import { UnifiedText } from '../shared-components/UnifiedText'

export const CreateGroupHeader: React.FC<{
	title: string
	style?: StyleProp<ViewStyle>
}> = ({ title, style = null }) => {
	const { height, border, margin, row, padding, text, column } = useStyles()
	const colors = useThemeColor()

	return (
		<View style={[border.radius.top.scale(30), { backgroundColor: '#F2F2F2' }, style]}>
			<View style={[height(90)]}>
				<View
					style={[
						margin.top.medium,
						row.item.justify,
						border.radius.scale(4),
						{
							backgroundColor: `${colors['secondary-text']}70`,
							height: 5,
							width: 60,
						},
					]}
				/>
				<View style={[margin.top.small]}>
					<View style={[row.fill, padding.horizontal.medium, padding.top.small]}>
						<UnifiedText style={[text.bold, text.size.scale(25), column.item.center]}>
							{title}
						</UnifiedText>
					</View>
				</View>
			</View>
		</View>
	)
}
