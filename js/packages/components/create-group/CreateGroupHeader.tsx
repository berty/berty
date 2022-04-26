import React from 'react'
import { TouchableWithoutFeedback, View } from 'react-native'
import { Icon } from '@ui-kitten/components'

import { useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

import { UnifiedText } from '../shared-components/UnifiedText'

export const Header: React.FC<{
	title: string
	icon?: string
	iconPack?: string
	first?: boolean
	disabled?: boolean
	onPress?: any
	style?: any
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
		<View style={[!first && { backgroundColor: colors['main-background'] }]}>
			<TouchableWithoutFeedback onPress={onPress}>
				<View
					style={[
						border.radius.top.scale(30),
						!first && border.shadow.big,
						!first && { shadowColor: colors.shadow },
						disabled && opacity(0.5),
						{ backgroundColor: colors['main-background'] },
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
