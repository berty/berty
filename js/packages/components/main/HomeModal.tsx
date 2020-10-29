import React from 'react'
import {
	View,
	TouchableOpacity,
	StyleSheet,
	TouchableWithoutFeedback,
	Text as TextNative,
} from 'react-native'
import { Icon } from '@ui-kitten/components'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'

import { useStyles } from '@berty-tech/styles'

const HomeModalButton: React.FC<{
	value: string
	bgColor: string
	icon: string
	iconSize?: number
	iconPack: string
	left?: boolean
	right?: boolean
	onPress: any
}> = ({ value, bgColor, icon, iconSize = 30, iconPack, right, left, onPress }) => {
	const [{ border, width, height, padding, color, text, margin }] = useStyles()

	return (
		<TouchableOpacity
			style={[
				{
					backgroundColor: bgColor,
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
				},
				width(75),
				height(90),
				border.radius.medium,
				padding.small,
				padding.top.medium,
				right ? margin.left.small : null,
				left ? margin.right.small : null,
			]}
			onPress={onPress}
		>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<Icon name={icon} pack={iconPack} fill={color.white} width={iconSize} height={iconSize} />
			</View>
			<TextNative
				numberOfLines={1}
				style={[
					text.color.white,
					text.bold.medium,
					margin.top.tiny,
					text.align.center,
					text.size.scale(18),
					{ fontFamily: 'Open Sans' },
				]}
			>
				{value}
			</TextNative>
		</TouchableOpacity>
	)
}

export const HomeModal: React.FC<{}> = () => {
	const navigation = useNativeNavigation()
	const [{ absolute, color, margin }, { windowWidth, scaleSize }] = useStyles()

	return (
		<>
			<TouchableWithoutFeedback style={[StyleSheet.absoluteFill]} onPress={navigation.goBack}>
				<View style={{ width: '100%', height: '100%' }} />
			</TouchableWithoutFeedback>
			<View
				style={[
					absolute.bottom,
					margin.bottom.scale(100),
					{ marginLeft: windowWidth / 2 - 85 * scaleSize },
				]}
			>
				<View
					style={[
						{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
					]}
				>
					<HomeModalButton
						value='Scan'
						bgColor={color.red}
						icon='qr'
						iconPack='custom'
						onPress={() => navigation.navigate('Main.Scan')}
						left
					/>
					<HomeModalButton
						value='Group'
						bgColor='#527FEC'
						icon='users'
						iconPack='custom'
						onPress={() => navigation.navigate('Main.CreateGroupAddMembers')}
						right
					/>
				</View>
			</View>
		</>
	)
}
