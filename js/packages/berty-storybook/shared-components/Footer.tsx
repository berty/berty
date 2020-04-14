import React from 'react'
import { TouchableOpacity, View, Image, StyleSheet, SafeAreaView } from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { useStyles, ColorsTypes } from '@berty-tech/styles'
import LinearGradient from 'react-native-linear-gradient'
import Jdenticon from 'react-native-jdenticon'

//
// Footer
//

// Type

type ButtonFooterProps = {
	size?: number
	backgroundColor?: ColorsTypes
	avatarUri?: string
	seed?: string
	icon?: string
	elemSize?: number
	elemColor?: ColorsTypes
	onPress: (arg0: any) => void
	selected: boolean
	selectedElemSize?: number
}

type FooterProps = {
	left: ButtonFooterProps
	center: ButtonFooterProps
	right: ButtonFooterProps
}

const ButtonFooter: React.FC<ButtonFooterProps> = ({
	backgroundColorProp = 'white',
	selectedBackgroundColor: selectedBackgroundColorProp,
	avatarUri = null,
	icon = null,
	size: sizeProp = 47,
	selectedSize = 59,
	elemSize: elemSizeProp = 21,
	selectedElemSize = 31,
	elemColor: elemColorProp,
	selectedElemColor = 'white',
	seed = null,
	onPress,
	selected,
}) => {
	const [{ border, column, width, height, color }] = useStyles()
	const size = selected ? selectedSize : sizeProp
	const elemSize = selected ? selectedElemSize : elemSizeProp
	const elemColor = selected ? selectedElemColor : elemColorProp || color.blue
	const selectedBackgroundColor = selectedBackgroundColorProp || color.blue
	const backgroundColor = selected ? selectedBackgroundColor : backgroundColorProp

	return (
		<View
			style={{
				width: selectedSize,
				height: selectedSize,
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<TouchableOpacity
				onPress={onPress}
				style={[
					border.shadow.medium,
					column.justify,
					{
						backgroundColor: seed ? 'white' : backgroundColor,
						width: size,
						height: size,
						borderRadius: size / 2,
						borderWidth: seed ? 3 : undefined,
						borderColor: seed ? backgroundColor : undefined,
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
							border.radius.scale(elemSize / 2),
						]}
						source={{ uri: avatarUri }}
					/>
				)}
				{seed && (
					<View
						style={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'center',
						}}
					>
						<Jdenticon value={seed} size={elemSize} style={{}} />
					</View>
				)}
			</TouchableOpacity>
		</View>
	)
}

export const Footer: React.FC<FooterProps> = ({ left, center, right }) => {
	const [{ absolute }] = useStyles()
	return (
		<LinearGradient
			style={[
				absolute.bottom,
				absolute.left,
				absolute.right,
				{ alignItems: 'center', justifyContent: 'center' },
			]}
			colors={['#ffffff00', '#ffffff80', '#ffffffc0', '#ffffffff']}
		>
			<SafeAreaView
				style={{
					width: '72.8%',
					justifyContent: 'space-between',
					flexDirection: 'row',
				}}
			>
				<ButtonFooter {...left} />
				<ButtonFooter {...center} />
				<ButtonFooter {...right} />
			</SafeAreaView>
		</LinearGradient>
	)
}
export default Footer
