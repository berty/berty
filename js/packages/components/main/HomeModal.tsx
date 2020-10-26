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
	iconPack: string
	left?: boolean
	right?: boolean
	onPress: any
}> = ({ value, bgColor, icon, iconPack, right, left, onPress }) => {
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
			<Icon name={icon} pack={iconPack} fill={color.white} width={25} height={25} />
			<TextNative
				numberOfLines={1}
				style={[
					text.color.white,
					text.bold.medium,
					text.align.center,
					padding.top.tiny,
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
	const [{ absolute, color, margin }] = useStyles()

	return (
		<>
			<TouchableWithoutFeedback style={[StyleSheet.absoluteFill]} onPress={navigation.goBack}>
				<View style={{ width: '100%', height: '100%' }} />
			</TouchableWithoutFeedback>
			<View style={[absolute.bottom, absolute.left, absolute.right]}>
				<View
					style={[{ flexDirection: 'row', justifyContent: 'center' }, margin.bottom.scale(100)]}
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
