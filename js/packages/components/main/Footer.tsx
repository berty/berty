import React, { useEffect, useMemo } from 'react'
import { TouchableOpacity, View, Animated, Easing } from 'react-native'
import { Icon } from '@ui-kitten/components'
import LinearGradient from 'react-native-linear-gradient'
import { useStyles } from '@berty-tech/styles'
import { SafeAreaConsumer } from 'react-native-safe-area-context'

type ButtonFooterProps = {
	icon?: string
	iconPack?: string
	onPress: any
	selected: boolean
	disabled?: boolean
	selectedElemSize?: number
	isModalVisible: boolean
}

const ButtonFooter: React.FC<ButtonFooterProps> = ({
	icon = null,
	iconPack,
	onPress,
	selected,
	disabled = false,
	isModalVisible,
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
	let rotateValue = useMemo(() => new Animated.Value(0), [])
	useEffect(() => {
		Animated.timing(rotateValue, {
			toValue: isModalVisible ? 1 : 0,
			duration: 300,
			easing: Easing.linear,
			useNativeDriver: false,
		}).start()
	}, [isModalVisible, rotateValue])

	const rotateAnimation = rotateValue.interpolate({
		inputRange: [0, 1],
		outputRange: ['0deg', '45deg'],
	})

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
				<Animated.View
					style={[
						{
							justifyContent: 'center',
							alignItems: 'center',

							transform: [
								{
									rotate: rotateAnimation,
								},
							],
						},
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
				</Animated.View>
			</TouchableOpacity>
		</View>
	)
}

const max = (a: number, b: number) => (a >= b ? a : b)

export const Footer: React.FC<{
	isModalVisible: boolean
	openModal: () => void
}> = ({ isModalVisible, openModal }) => {
	const [{ absolute }] = useStyles()

	const props = {
		icon: 'plus-outline',
		onPress: openModal,
		selected: true,
		isModalVisible,
	}

	return (
		<>
			{isModalVisible && (
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
