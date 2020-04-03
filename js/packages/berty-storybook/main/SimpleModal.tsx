import React from 'react'
import { View } from 'react-native'
import { useResponsiveHeight, useResponsiveWidth } from 'react-native-responsive-dimensions'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'

export const SimpleModal: React.FC<{ title: string; color: string; iconName: string }> = ({
	children,
	title,
	color,
	iconName,
}) => {
	const [{ margin, row, border }] = useStyles()
	const bottomSpace = useResponsiveHeight(5)
	const size = useResponsiveWidth(90)
	const topSpace = useResponsiveHeight(4)
	const topPadding = useResponsiveHeight(1)
	return (
		<View
			style={[
				{
					height: '100%',
					flexGrow: 1,
					flexShrink: 0,
					paddingBottom: bottomSpace,
					backgroundColor: color,
				},
			]}
		>
			<View
				style={[
					margin.top.small,
					row.item.justify,
					border.scale(2.5),
					border.color.light.grey,
					border.radius.scale(4),
					{
						backgroundColor: 'white',
						width: '14%',
						opacity: 0.6,
					},
				]}
			/>
			<View
				style={{
					flexDirection: 'row',
					alignSelf: 'center',
					alignItems: 'center',
					justifyContent: 'space-between',
					width: size,
					marginBottom: topSpace,
					marginTop: topPadding,
				}}
			>
				<Text
					style={{
						color: 'white',
						fontSize: 26,
						lineHeight: 40,
						fontWeight: '700',
						paddingLeft: 5,
					}}
				>
					{title}
				</Text>
				<Icon
					name={iconName}
					width={35}
					height={35}
					fill={'white'}
					style={[row.item.justify, { padding: 0, margin: 0 }]}
				/>
			</View>
			{children}
		</View>
	)
}
