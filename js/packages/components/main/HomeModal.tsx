import React, { useState } from 'react'
import {
	View,
	TouchableOpacity,
	StyleSheet,
	TouchableWithoutFeedback,
	Text as TextNative,
	Animated,
} from 'react-native'
import { Icon } from '@ui-kitten/components'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'
import { Translation } from 'react-i18next'
import LinearGradient from 'react-native-linear-gradient'
import {
	PanGestureHandler,
	State,
	PanGestureHandlerStateChangeEvent,
	PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler'

import { useStyles } from '@berty-tech/styles'

const HomeModalButton: React.FC<{
	value?: string
	bgColor?: string
	icon?: string
	iconSize?: number
	iconPack?: string
	left?: boolean
	right?: boolean
	onPress: any
	children?: any
	hasMarginBottom?: boolean
	hasShadow?: boolean
}> = ({
	value,
	bgColor,
	icon,
	iconSize = 60,
	iconPack,
	onPress,
	children = null,
	hasMarginBottom,
	hasShadow = false,
}) => {
	const [{ border, color, text, margin }] = useStyles()

	return (
		<TouchableOpacity
			style={[
				{
					flexDirection: 'column',
					justifyContent: 'center',
					width: '100%',
				},
				border.radius.medium,
				hasMarginBottom && margin.bottom.large,
			]}
			onPress={onPress}
		>
			{children ? (
				children
			) : (
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<View
						style={[
							{
								backgroundColor: bgColor,
								paddingVertical: 22,
								paddingHorizontal: 15,
							},
							border.radius.medium,
							margin.right.large,
							hasShadow && {
								shadowColor: '#000',
								shadowOffset: {
									width: 0,
									height: 4,
								},
								shadowOpacity: 0.4,
								shadowRadius: 4,
								elevation: 16,
							},
						]}
					>
						<Icon
							name={icon}
							pack={iconPack}
							fill={color.white}
							width={iconSize}
							height={iconSize}
						/>
					</View>
					<TextNative
						numberOfLines={1}
						style={[
							text.color.black,
							text.bold.medium,
							text.size.scale(18),
							{ fontFamily: 'Open Sans' },
						]}
					>
						{value}
					</TextNative>
				</View>
			)}
		</TouchableOpacity>
	)
}

export const HomeModal: React.FC<{
	closeModal: () => void
}> = ({ closeModal }) => {
	const navigation = useNativeNavigation()
	const [{ absolute, color, margin, border, padding }] = useStyles()
	const [animateSwipe] = useState(new Animated.Value(-100))

	function slideUp() {
		Animated.timing(animateSwipe, {
			toValue: 0,
			duration: 250,
			useNativeDriver: false,
		}).start()
	}

	function slideDown() {
		Animated.timing(animateSwipe, {
			toValue: -100,
			duration: 200,
			useNativeDriver: false,
		}).start(closeModal)
	}

	React.useEffect(slideUp, [animateSwipe])

	function onPanGestureEvent(event: PanGestureHandlerGestureEvent): void {
		let toValue = 0
		if (event.nativeEvent.translationY > 0) {
			toValue = -event.nativeEvent.translationY
		} else {
			toValue = 0
		}

		toValue &&
			Animated.timing(animateSwipe, {
				toValue,
				duration: 100,
				useNativeDriver: false,
			}).start()
	}

	function onHandlerStateChange(event: PanGestureHandlerStateChangeEvent): void {
		if (event.nativeEvent.oldState === State.ACTIVE) {
			if (event.nativeEvent.translationY > 100 || event.nativeEvent.velocityY > 100) {
				slideDown()
			} else {
				slideUp()
			}
		}
	}

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View style={[StyleSheet.absoluteFill, { zIndex: 1, elevation: 4 }]}>
					<LinearGradient
						style={[
							absolute.bottom,
							{
								alignItems: 'center',
								justifyContent: 'center',
								height: '100%',
								width: '100%',
								opacity: 0.1,
							},
						]}
						colors={['#ACACFF', '#06068A']}
						start={{
							x: 0,
							y: 0.3,
						}}
						end={{
							x: 0,
							y: 1,
						}}
					/>
					<View
						style={[
							absolute.bottom,
							{
								alignItems: 'center',
								backgroundColor: '#11114C',
								justifyContent: 'center',
								height: '100%',
								width: '100%',
								opacity: 0.1,
							},
						]}
					/>
					<TouchableWithoutFeedback style={{ flex: 1 }} onPress={slideDown}>
						<View style={{ width: '100%', height: '100%' }} />
					</TouchableWithoutFeedback>
					<PanGestureHandler
						onGestureEvent={onPanGestureEvent}
						onHandlerStateChange={onHandlerStateChange}
					>
						<Animated.View
							style={[
								absolute.bottom,
								{
									width: '100%',
									bottom: animateSwipe,
								},
							]}
						>
							<View
								style={[
									{
										backgroundColor: 'white',
										flex: 1,
									},
									border.radius.top.medium,
									padding.vertical.large,
									padding.horizontal.medium,
									padding.top.medium,
								]}
							>
								<View
									style={[
										{
											backgroundColor: '#EDEFF3',
											height: 5,
											width: 70,
											alignSelf: 'center',
										},
										border.radius.small,
										margin.bottom.medium,
									]}
								/>
								<HomeModalButton
									value={t('main.home-modal.top-button')}
									bgColor='#527FEC'
									onPress={() => navigation.navigate('Main.CreateGroupAddMembers')}
									hasMarginBottom
									icon='add-new-group'
									iconPack='custom'
								/>
								<HomeModalButton
									value={t('main.home-modal.bottom-button')}
									bgColor={color.red}
									icon='qr'
									iconPack='custom'
									onPress={() => navigation.navigate('Main.Scan')}
									hasShadow
								/>
							</View>
						</Animated.View>
					</PanGestureHandler>
				</View>
			)}
		</Translation>
	)
}
