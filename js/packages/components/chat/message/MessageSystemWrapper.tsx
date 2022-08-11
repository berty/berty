import React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'

import Logo from '@berty/assets/logo/1_berty_picto.svg'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

const MessageSystemLogo = () => {
	const { border, flex, margin, width, height } = useStyles()
	const colors = useThemeColor()
	const logoDiameter = 28
	const diffSize = 6

	return (
		<View
			style={{
				transform: [{ translateY: Math.round(-logoDiameter * 1.15) }],
				alignSelf: 'center',
				marginBottom: -logoDiameter, // compensate for transformed logo
			}}
		>
			<View
				style={[
					flex.align.center,
					flex.justify.center,
					width(logoDiameter + diffSize),
					height(logoDiameter + diffSize),
					border.radius.scale((logoDiameter + diffSize) / 2),
					{
						borderWidth: 1,
						borderColor: colors['input-background'],
						backgroundColor: colors['main-background'],
					},
				]}
			>
				<Logo
					width={logoDiameter - diffSize}
					height={logoDiameter - diffSize}
					style={[margin.left.tiny]} // nudge logo to appear centered
				/>
			</View>
		</View>
	)
}

export const MessageSystemWrapper: React.FC<{
	styleContainer?: StyleProp<ViewStyle>
	logo?: boolean
}> = ({ children, styleContainer = {}, logo = true }) => {
	const { padding, border, margin, width } = useStyles()
	const colors = useThemeColor()
	const logoDiameter = 28
	return (
		<View
			style={[
				{ backgroundColor: colors['input-background'] },
				padding.medium,
				logo && margin.top.scale(logoDiameter * 0.75), // make room for logo
				width(350),
				border.radius.scale(10),
				{
					shadowOpacity: 0.1,
					shadowRadius: 4,
					shadowColor: colors.shadow,
					shadowOffset: { width: 0, height: 2.5 },
				},
				styleContainer,
			]}
		>
			{logo && <MessageSystemLogo />}
			{children}
		</View>
	)
}
