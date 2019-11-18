import React from 'react'
import { TouchableOpacity, View, Image } from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { colors, styles } from '../styles'

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
}

type FooterProps = {
	left: ButtonFooterProps
	center: ButtonFooterProps
	right: ButtonFooterProps
}

const ButtonFooter: React.FC<ButtonFooterProps> = ({
	backgroundColor = colors.white,
	avatarUri = null,
	icon = null,
	size = 45,
	elemSize = 20,
	elemColor = colors.blue,
}) => (
	<TouchableOpacity>
		<View
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
		</View>
	</TouchableOpacity>
)

export const Footer: React.FC<FooterProps> = ({ left, center, right }) => (
	<View
		style={[
			styles.absolute,
			styles.bottom,
			styles.left,
			styles.right,
			styles.marginBottom,
			styles.padding,
			styles.row,
			styles.spaceAround,
			styles.alignItems,
		]}
	>
		<ButtonFooter {...left} />
		<ButtonFooter {...center} />
		<ButtonFooter {...right} />
	</View>
)

export default Footer
