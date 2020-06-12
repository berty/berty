import React from 'react'
import { TouchableOpacity, View, Image } from 'react-native'
import { Icon } from 'react-native-ui-kitten'
import { useStyles, ColorsTypes } from '@berty-tech/styles'
import LinearGradient from 'react-native-linear-gradient'
import Jdenticon from 'react-native-jdenticon'
import { SafeAreaConsumer } from 'react-native-safe-area-context'

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
	disabled?: boolean
	iconPack?: string
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
	iconPack,
	size: sizeProp = 47,
	selectedSize = 59,
	elemSize: elemSizeProp = 21,
	selectedElemSize = 31,
	elemColor: elemColorProp,
	iconStyle,
	selectedElemColor = 'white',
	seed = null,
	onPress,
	selected,
	disabled = false,
}) => {
	const [{ border, column, width, height, color, opacity }] = useStyles()
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
				activeOpacity={disabled ? 1 : undefined}
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
					<View
						style={[
							{ justifyContent: 'center', alignItems: 'center' },
							disabled ? opacity(0.5) : null,
						]}
					>
						<Icon
							name={icon}
							pack={iconPack}
							width={elemSize}
							height={elemSize}
							fill={elemColor}
							style={iconStyle}
						/>
					</View>
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

const max = (a: number, b: number) => (a >= b ? a : b)

export const Footer: React.FC<FooterProps> = ({ left, center, right }) => {
	const [{ absolute }] = useStyles()
	return (
		<LinearGradient
			style={[absolute.bottom, { alignItems: 'center', justifyContent: 'center', width: '100%' }]}
			colors={['#ffffff00', '#ffffff80', '#ffffffc0', '#ffffffff']}
		>
			<SafeAreaConsumer>
				{(insets) => (
					<View
						style={{
							width: '72.8%',
							justifyContent: 'space-between',
							flexDirection: 'row',
							paddingBottom: max(insets?.bottom || 0, 25),
						}}
					>
						<ButtonFooter {...left} />
						<ButtonFooter {...center} />
						<ButtonFooter {...right} />
					</View>
				)}
			</SafeAreaConsumer>
		</LinearGradient>
	)
}
export default Footer
