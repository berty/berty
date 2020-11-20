import React from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty-tech/styles'
import Logo from '../../main/1_berty_picto.svg'

const MessageSystemLogo = () => {
	const [{ border, flex, margin, width, background, height }, { scaleSize }] = useStyles()
	const logoDiameter = 28
	const diffSize = 6
	return (
		<View
			style={{
				transform: [{ translateY: -logoDiameter * 1.15 * scaleSize }],
				alignSelf: 'center',
				marginBottom: -logoDiameter * scaleSize, // compensate for transformed logo
			}}
		>
			<View
				style={[
					flex.align.center,
					flex.justify.center,
					width(logoDiameter + diffSize * scaleSize),
					height(logoDiameter + diffSize * scaleSize),
					background.white,
					border.radius.scale((logoDiameter + diffSize) / 2),
					{
						borderWidth: 2,
						borderColor: 'rgba(215, 217, 239, 1)',
					},
				]}
			>
				<Logo
					width={scaleSize * logoDiameter - diffSize}
					height={scaleSize * logoDiameter - diffSize}
					style={[margin.left.tiny]} // nudge logo to appear centered
				/>
			</View>
		</View>
	)
}

export const MessageSystemWrapper: React.FC<{
	children: any
	styleContainer?: any
	logo?: boolean
}> = ({ children, styleContainer = {}, logo = true }) => {
	const [{ padding, border, margin, width }] = useStyles()
	const logoDiameter = 28
	return (
		<View
			style={[
				{ backgroundColor: '#EDEEF8' },
				padding.medium,
				logo && margin.top.scale(logoDiameter * 0.75), // make room for logo
				width(350),
				border.radius.scale(10),
				{ shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2.5 } },
				styleContainer,
			]}
		>
			{logo && <MessageSystemLogo />}
			{children}
		</View>
	)
}
