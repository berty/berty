import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleProp, TouchableWithoutFeedback, View, ViewStyle } from 'react-native'

import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

import { UnifiedText } from '../shared-components/UnifiedText'

export const CreateGroupHeader: React.FC<{
	title: string
	icon?: string
	iconPack?: string
	first?: boolean
	disabled?: boolean
	onPress?: () => void
	style?: StyleProp<ViewStyle>
}> = ({
	children,
	title,
	icon,
	iconPack,
	first = false,
	disabled = false,
	onPress = null,
	style = null,
}) => {
	const { height, border, margin, row, padding, text, column, opacity } = useStyles()
	const { scaleHeight } = useAppDimensions()
	const colors = useThemeColor()

	return (
		<View style={[!first && { backgroundColor: '#FFFFFF' }]}>
			<TouchableWithoutFeedback onPress={() => onPress?.()}>
				<View
					style={[
						border.radius.top.scale(30),
						!first && border.shadow.big,
						!first && { shadowColor: colors.shadow },
						disabled && opacity(0.5),
						{ backgroundColor: '#FFFFFF' },
						style,
					]}
				>
					<View style={[height(90)]}>
						<View
							style={[
								margin.top.medium,
								row.item.justify,
								border.radius.scale(4),
								{
									backgroundColor: `${colors['secondary-text']}70`,
									height: 5 * scaleHeight,
									width: 60 * scaleHeight,
								},
							]}
						/>
						<View style={[margin.top.small]}>
							<View style={[row.fill, padding.horizontal.medium, padding.top.small]}>
								<UnifiedText style={[text.bold, text.size.scale(25), column.item.center]}>
									{title}
								</UnifiedText>
								{icon && (
									<Icon
										name={icon}
										pack={iconPack}
										width={30}
										height={30}
										fill={colors['main-text']}
									/>
								)}
							</View>
						</View>
					</View>
					{children && <View>{children}</View>}
				</View>
			</TouchableWithoutFeedback>
		</View>
	)
}
