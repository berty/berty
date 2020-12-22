import React, { useEffect, useState, useCallback } from 'react'
import { useStyles } from '@berty-tech/styles'
import { View, Modal, Image, TouchableOpacity, Animated } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import CameraRoll from '@react-native-community/cameraroll'
import Share from 'react-native-share'
import {
	TapGestureHandler,
	PanGestureHandler,
	State,
	PanGestureHandlerGestureEvent,
	PanGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler'
import { useConversationsCount } from '@berty-tech/store/hooks'
import { ForwardToBertyContactModal } from './ForwardToBertyContactModal'
import beapi from '@berty-tech/api'
import { useNavigation } from '@berty-tech/navigation'
import { useMemo } from 'react'

let mode: '' | 'vertical' | 'horizontal' = ''

const ImageComp: React.FC<{
	uri: string
	height: number
	width: number
	nativeVerticalEvent: PanGestureHandlerGestureEvent | false
}> = ({ uri, height, width, nativeVerticalEvent }) => {
	const [{}, { windowHeight, windowWidth }] = useStyles()

	const initialPosition = useMemo(
		() => ({
			x: (windowHeight - height) / 2,
			y: (windowWidth - width) / 2 + 2.5,
		}),
		[windowHeight, windowWidth, height, width],
	)
	const [position] = useState(
		new Animated.ValueXY({
			x: initialPosition.x,
			y: initialPosition.y,
		}),
	)

	useEffect(() => {
		if (nativeVerticalEvent) {
			position.setValue({
				x: nativeVerticalEvent.nativeEvent.translationY + initialPosition.x,
				y: nativeVerticalEvent.nativeEvent.translationX + initialPosition.y,
			})
		} else {
			Animated.spring(position, {
				toValue: { x: initialPosition.x, y: initialPosition.y },
				useNativeDriver: false,
				friction: 10,
			}).start()
		}
	}, [nativeVerticalEvent, initialPosition, position])
	return (
		<View
			style={{
				position: 'relative',
				height: windowHeight,
				width: windowWidth,
			}}
		>
			<Animated.View
				style={{
					position: 'absolute',
					top: position.x,
					left: position.y,
				}}
			>
				<Image
					source={{ uri }}
					style={{
						height: height,
						width: width - 5,
					}}
				/>
			</Animated.View>
		</View>
	)
}

export const ImageView: React.FC<{
	route: {
		params: {
			images: beapi.messenger.IMedia[]
		}
	}
}> = ({
	route: {
		params: { images },
	},
}) => {
	const [{ color, border, padding }, { windowWidth, windowHeight }] = useStyles()
	const { t }: { t: any } = useTranslation()
	const hasConversation = useConversationsCount()
	const { goBack } = useNavigation()

	const [imagesWithDimensions, setImagesWithDimensions] = useState<any[]>([])
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isModalVisible, setModalVisibility] = useState(false)
	const [isForwardModalVisible, setForwardModalVisibility] = useState(false)
	const [message, setMessage] = useState('')
	const [nativeVerticalEvent, setNativeVerticalEvent] = useState<
		false | PanGestureHandlerGestureEvent
	>(false)
	const [animatedBackgroundColor] = useState(new Animated.Value(0))
	const [animatedLeft] = useState(new Animated.Value(-(currentIndex * windowWidth)))
	const interpolatedColor = animatedBackgroundColor.interpolate({
		inputRange: [0, 1],
		outputRange: ['rgba(0,0,0,1)', 'rgba(0,0,0,0.4)'],
	})

	const handleMessage = (msg: string) => {
		setMessage(msg)
		setTimeout(() => setMessage(''), 1400)
	}

	const MENU_LIST = [
		{
			title: t('chat.files.save-to-gallery'),
			onPress() {
				imagesWithDimensions[currentIndex] &&
					CameraRoll.save(imagesWithDimensions[currentIndex].uri, { type: 'photo' })
						.then(() => {
							setModalVisibility(false)
							handleMessage(t('chat.files.image-saved'))
						})
						.catch((err) => console.log(err))
			},
		},
		{
			title: t('chat.files.share'),
			onPress() {
				imagesWithDimensions[currentIndex] &&
					Share.open({
						url: imagesWithDimensions[currentIndex].uri,
					})
						.then(() => {})
						.catch((err) => {
							err && console.log(err)
						})
			},
		},
		...(hasConversation
			? [
					{
						title: t('chat.files.forward-berty'),
						onPress() {
							setForwardModalVisibility(true)
							setModalVisibility(false)
						},
					},
			  ]
			: []),
	]

	const getImageSize = useCallback(
		async (images: any[]) => {
			const imageSizes = await Promise.all(
				images.map((image) => {
					return new Promise((resolve) => {
						Image.getSize(
							image.uri,
							(width, height) => {
								resolve({
									...image,
									height,
									width,
								})
							},
							() => {
								resolve({
									...image,
									height: 200,
									width: windowWidth,
								})
							},
						)
					})
				}),
			)

			setImagesWithDimensions(imageSizes || [])
		},
		[windowWidth],
	)

	useEffect(() => {
		getImageSize(images)
	}, [images, getImageSize])

	function animatePositionLeft({ nativeEvent }: PanGestureHandlerGestureEvent) {
		let leftLimit
		let rightLimit
		if (currentIndex === 0) {
			leftLimit = -windowWidth
			rightLimit = 0
		} else if (currentIndex === images.length - 1) {
			leftLimit = -(currentIndex * windowWidth)
			rightLimit = -(currentIndex - 1 * windowWidth)
		} else {
			leftLimit = -((currentIndex + 1) * windowWidth)
			rightLimit = -((currentIndex - 1) * windowWidth)
		}
		let calculatedValue = +nativeEvent.translationX - currentIndex * windowWidth

		if (calculatedValue < leftLimit) {
			calculatedValue = leftLimit
		} else if (calculatedValue > rightLimit) {
			calculatedValue = rightLimit
		}

		Animated.timing(animatedLeft, {
			toValue: calculatedValue,
			duration: 10,
			useNativeDriver: false,
		}).start()
	}

	function onPanGestureEvent({ nativeEvent }: PanGestureHandlerGestureEvent) {
		if (!mode) {
			if (Math.abs(nativeEvent.velocityY) > 700) {
				mode = 'vertical'
			} else if (Math.abs(nativeEvent.velocityX) > 700) {
				mode = 'horizontal'
				setNativeVerticalEvent(false)
			}
		}

		if (
			mode === 'vertical' ||
			(mode === 'horizontal' && currentIndex === 0 && nativeEvent.translationX > 5) ||
			(mode === 'horizontal' && currentIndex === images.length - 1 && nativeEvent.translationX < -5)
		) {
			setNativeVerticalEvent({ nativeEvent })
			animatedBackgroundColor.setValue(
				Math.max(
					Math.abs(nativeEvent.translationY) / windowHeight,
					Math.abs(nativeEvent.translationX) / windowWidth,
				),
			)
		} else if (mode === 'horizontal') {
			animatePositionLeft({ nativeEvent })
		}
	}

	function onHandlerStateChange({ nativeEvent }: PanGestureHandlerStateChangeEvent) {
		if (nativeEvent.oldState === State.ACTIVE) {
			if (mode === 'horizontal' && !nativeVerticalEvent) {
				if (nativeEvent.velocityX < -300 || nativeEvent.translationX < -100) {
					if (currentIndex === images.length - 1) {
						return
					} else {
						let value = -((currentIndex + 1) * windowWidth)

						Animated.timing(animatedLeft, {
							toValue: value,
							duration: 300,
							useNativeDriver: false,
						}).start()
						setCurrentIndex(currentIndex + 1)
					}
				} else if (nativeEvent.velocityX > 300 || nativeEvent.translationX > 100) {
					if (currentIndex === 0) {
						return
					} else {
						let value = -((currentIndex - 1) * windowWidth)
						Animated.timing(animatedLeft, {
							toValue: value,
							duration: 300,
							useNativeDriver: false,
						}).start()
						setCurrentIndex(currentIndex - 1)
					}
				} else {
					let value = -(currentIndex * windowWidth)
					Animated.timing(animatedLeft, {
						toValue: value,
						duration: 300,
						useNativeDriver: false,
					}).start()
				}
			} else {
				const firstIndexTestValue =
					mode === 'horizontal' && currentIndex === 0 && nativeEvent.translationX > 5
						? Math.abs(nativeEvent.translationX) / windowWidth
						: 0

				const lastIndexTestValue =
					mode === 'horizontal' &&
					currentIndex === images.length - 1 &&
					nativeEvent.translationX < -5
						? Math.abs(nativeEvent.translationX) / windowWidth
						: 0
				if (
					Math.max(
						firstIndexTestValue,
						lastIndexTestValue,
						Math.abs(nativeEvent.translationY) / windowHeight,
					) > 0.25
				) {
					goBack()
				} else {
					animatedBackgroundColor.setValue(0)
					setNativeVerticalEvent(false)
				}
			}

			mode = ''
		}
	}

	return (
		<Animated.View
			style={{
				backgroundColor: interpolatedColor,
				flex: 1,
			}}
		>
			<TapGestureHandler
				onHandlerStateChange={(event) => {
					if (event.nativeEvent.oldState === State.ACTIVE) {
						setModalVisibility((prev) => !prev)
					}
				}}
			>
				<PanGestureHandler
					onGestureEvent={onPanGestureEvent}
					onHandlerStateChange={onHandlerStateChange}
				>
					<Animated.View
						style={{
							left: animatedLeft,
							position: 'absolute',
							top: 0,
							flexDirection: 'row',
						}}
					>
						{imagesWithDimensions.map((image, index) => {
							let height: number
							let width = windowWidth
							if (image.width > image.height) {
								height = width * (image.height / image.width)
							} else {
								height = width * (image.height / image.width)
							}

							return (
								<ImageComp
									key={image.cid}
									uri={image.uri}
									height={height}
									width={width}
									nativeVerticalEvent={currentIndex === index && nativeVerticalEvent}
								/>
							)
						})}
					</Animated.View>
				</PanGestureHandler>
			</TapGestureHandler>

			{isModalVisible && (
				<Modal transparent animationType='fade'>
					<TouchableOpacity
						style={[padding.medium, { position: 'absolute', top: 50, left: 10, zIndex: 9 }]}
						activeOpacity={0.8}
						onPress={goBack}
					>
						<Icon
							name='arrow-back-outline'
							fill='white'
							style={{
								opacity: 0.8,
							}}
							height={30}
							width={30}
						/>
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => setModalVisibility(false)}
						style={{
							flex: 1,
						}}
					/>
					<View
						style={[
							{
								position: 'absolute',
								left: 0,
								bottom: 0,
								right: 0,
								backgroundColor: color.white,
							},
							padding.medium,
							border.radius.top.large,
						]}
					>
						{MENU_LIST.map((item) => (
							<TouchableOpacity key={item.title} onPress={item.onPress} style={[padding.medium]}>
								<Text
									style={{
										textAlign: 'center',
									}}
								>
									{item.title}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</Modal>
			)}
			{!!message && (
				<View
					style={[
						{
							position: 'absolute',
							bottom: 100,
							alignItems: 'center',
							justifyContent: 'center',
							right: 0,
							left: 0,
						},
					]}
				>
					<View
						style={[
							border.radius.large,
							padding.vertical.small,
							padding.horizontal.large,
							{
								backgroundColor: 'white',
							},
						]}
					>
						<Text
							style={[
								{
									color: 'black',
								},
							]}
						>
							{message}
						</Text>
					</View>
				</View>
			)}
			{isForwardModalVisible && (
				<ForwardToBertyContactModal
					image={imagesWithDimensions[currentIndex]}
					onClose={() => setForwardModalVisibility(false)}
				/>
			)}
		</Animated.View>
	)
}
