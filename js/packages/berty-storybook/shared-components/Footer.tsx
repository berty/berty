import React from 'react'
import { TouchableOpacity, View, Image, StyleSheet, SafeAreaView } from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { colors, styles } from '@berty-tech/styles'
import LinearGradient from 'react-native-linear-gradient'

//
// Footer
//

// Type

type ButtonFooterProps = {
	size?: number
	backgroundColor?: string
	avatarUri?: string
	icon?: string
	elemSize?: number
	elemColor?: string
	onPress: (arg0: any) => void
}

type FooterProps = {
	left: ButtonFooterProps
	center: ButtonFooterProps
	right: ButtonFooterProps
	onLayout: (event: any) => void
}

const ButtonFooter: React.FC<ButtonFooterProps> = ({
	backgroundColor = colors.white,
	avatarUri = null,
	icon = null,
	size = 45,
	elemSize = 20,
	elemColor = colors.blue,
	onPress,
}) => (
	<TouchableOpacity
		onPress={onPress}
		style={[
			styles.shadow,
			styles.justifyContent,
			{
				backgroundColor,
				width: size,
				height: size,
				borderRadius: size / 2,
			},
		]}
	>
		{icon && (
			<Icon
				style={[styles.center]}
				name={icon}
				width={elemSize}
				height={elemSize}
				fill={elemColor}
			/>
		)}
		{avatarUri && (
			<Image
				style={[styles.center, { width: elemSize, height: elemSize, borderRadius: elemSize / 2 }]}
				source={{ uri: avatarUri }}
			/>
		)}
	</TouchableOpacity>
)

export const Footer: React.FC<FooterProps> = ({ left, center, right, onLayout }) => (
	<LinearGradient
		onLayout={onLayout}
		style={[styles.absolute, styles.bottom, styles.left, styles.right]}
		colors={['#ffffff00', '#ffffff80', '#ffffffc0', '#ffffffff']}
	>
		<SafeAreaView style={[styles.flex, styles.row, styles.spaceAround, styles.alignItems]}>
			<ButtonFooter {...left} />
			<ButtonFooter {...center} />
			<ButtonFooter {...right} />
		</SafeAreaView>
	</LinearGradient>
)

export default Footer
