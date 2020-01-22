import React from 'react'
import { TouchableOpacity, Image, SafeAreaView } from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import LinearGradient from 'react-native-linear-gradient'

//
// Footer
//

// Type

type ButtonFooterProps = {
	size?: number
	backgroundColor?: string
	avatarUri?: string | null
	icon?: string
	elemSize?: number
	elemColor?: string
	onPress: (arg0: any) => void
}

type FooterProps = {
	left: ButtonFooterProps
	center: ButtonFooterProps
	right: ButtonFooterProps
	// onLayout: (event: any) => void
}

const ButtonFooter: React.FC<ButtonFooterProps> = ({
	backgroundColor = 'white',
	avatarUri = null,
	icon = null,
	size = 45,
	elemSize = 20,
	elemColor = 'blue',
	onPress,
}) => {
	const [{ border, column, width, height }] = useStyles()
	return (
		<TouchableOpacity
			onPress={onPress}
			style={[
				border.shadow.medium,
				column.justify,
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
					style={[column.item.center]}
					name={icon}
					width={elemSize}
					height={elemSize}
					fill={elemColor}
				/>
			)}
			{avatarUri && (
				<Image
					style={[
						column.item.center,
						width(elemSize),
						height(elemSize),
						border.radius.scale(size / 2),
					]}
					source={{ uri: avatarUri }}
				/>
			)}
		</TouchableOpacity>
	)
}
export const Footer: React.FC<FooterProps> = ({ left, center, right }) => {
	const [{ row, absolute }] = useStyles()
	return (
		<LinearGradient
			// onLayout={onLayout}
			style={[absolute.bottom, absolute.left, absolute.right]}
			colors={['#ffffff00', '#ffffff80', '#ffffffc0', '#ffffffff']}
		>
			<SafeAreaView style={[row.center]}>
				<ButtonFooter {...left} />
				<ButtonFooter {...center} />
				<ButtonFooter {...right} />
			</SafeAreaView>
		</LinearGradient>
	)
}
export default Footer
