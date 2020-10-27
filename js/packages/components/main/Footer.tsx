import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useIsFocused } from '@react-navigation/native'
import { Icon } from '@ui-kitten/components'
import LinearGradient from 'react-native-linear-gradient'
import { useStyles } from '@berty-tech/styles'
import { useNavigation } from '@berty-tech/navigation'
import { SafeAreaConsumer } from 'react-native-safe-area-context'

type ButtonFooterProps = {
	icon?: string
	iconPack?: string
	onPress: any
	selected: boolean
	disabled?: boolean
	selectedElemSize?: number
}

const ButtonFooter: React.FC<ButtonFooterProps> = ({
	icon = null,
	iconPack,
	onPress,
	selected,
	disabled = false,
}) => {
	const [{ border, column, color, opacity }] = useStyles()
	const selectedSize = 59
	const sizeProp = 47
	const backgroundColorProp = 'white'
	const selectedElemColor = 'white'
	const elemSizeProp = 21
	const selectedElemSize = 35
	const size = selected ? selectedSize : sizeProp
	const elemSize = selected ? selectedElemSize : elemSizeProp
	const elemColor = selected ? selectedElemColor : color.blue
	const selectedBackgroundColor = color.blue
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
						backgroundColor,
						width: size,
						height: size,
						borderRadius: size / 2,
					},
				]}
			>
				<View
					style={[
						{ justifyContent: 'center', alignItems: 'center' },
						disabled ? opacity(0.5) : null,
					]}
				>
					<Icon
						name={icon || ''}
						pack={iconPack}
						width={elemSize}
						height={elemSize}
						fill={elemColor}
					/>
				</View>
			</TouchableOpacity>
		</View>
	)
}

const max = (a: number, b: number) => (a >= b ? a : b)

export const Footer: React.FC<{}> = () => {
	const [{ absolute }] = useStyles()
	const { navigate } = useNavigation()
	const isFocused = useIsFocused()
	const props = {
		icon: 'plus-outline',
		onPress: navigate.main.listModal,
		selected: true,
	}

	return (
		<>
			{!isFocused && (
				<LinearGradient
					style={[
						absolute.bottom,
						{
							alignItems: 'center',
							justifyContent: 'center',
							height: '25%',
							width: '100%',
						},
					]}
					colors={['#ffffff00', '#ffffff80', '#ffffffc0', '#ffffffff']}
				/>
			)}
			<View
				style={[
					{
						position: 'absolute',
						bottom: 0,
						alignItems: 'center',
						justifyContent: 'center',
						width: '100%',
					},
				]}
			>
				<SafeAreaConsumer>
					{(insets) => (
						<View
							style={{
								justifyContent: 'center',
								paddingBottom: max(insets?.bottom || 0, 25),
							}}
						>
							<ButtonFooter {...props} />
						</View>
					)}
				</SafeAreaConsumer>
			</View>
		</>
	)
}
