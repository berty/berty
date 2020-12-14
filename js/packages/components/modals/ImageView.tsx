import React, { useEffect, useState, useCallback } from 'react'
import { useStyles } from '@berty-tech/styles'
import { View, Modal, Image, TouchableOpacity } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native-gesture-handler'
import CameraRoll from '@react-native-community/cameraroll'
import Share from 'react-native-share'
import { TapGestureHandler, State } from 'react-native-gesture-handler'
import { useConversationsCount } from '@berty-tech/store/hooks'
import { ForwardToBertyContactModal } from './ForwardToBertyContactModal'
import beapi from '@berty-tech/api'
import { SwipeNavRecognizer } from '@berty-tech/components/shared-components/SwipeNavRecognizer'
import { useNavigation } from '@berty-tech/navigation'

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
	const [{ color, border, padding }, { windowWidth }] = useStyles()
	const { t }: { t: any } = useTranslation()
	const hasConversation = useConversationsCount()
	const { goBack } = useNavigation()

	const [imagesWithDimensions, setImagesWithDimensions] = useState<any[]>([])
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isModalVisible, setModalVisibility] = useState(false)
	const [isForwardModalVisible, setForwardModalVisibility] = useState(false)
	const [message, setMessage] = useState('')

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
						.then((res) => {
							console.log(res)
						})
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

	return (
		<Modal
			style={{
				position: 'relative',
				flex: 1,
			}}
		>
			<SwipeNavRecognizer onSwipeDown={goBack} onSwipeUp={goBack}>
				<TapGestureHandler
					onHandlerStateChange={(event) => {
						if (event.nativeEvent.oldState === State.ACTIVE) {
							setModalVisibility((prev) => !prev)
						}
					}}
				>
					<ScrollView
						style={[
							{
								backgroundColor: 'black',
								flex: 1,
							},
						]}
						horizontal
						contentContainerStyle={{
							alignItems: 'center',
						}}
						pagingEnabled
						scrollEventThrottle={20}
						onScroll={(e) => {
							let page = Math.round(e.nativeEvent.contentOffset.x / windowWidth)

							if (currentIndex !== page) {
								console.log('current index', currentIndex)
								setCurrentIndex(page)
							}
						}}
					>
						{imagesWithDimensions.map((image) => {
							let height: number
							let width = windowWidth
							if (image.width > image.height) {
								height = width * (image.height / image.width)
							} else {
								height = width * (image.height / image.width)
							}

							return (
								<Image
									key={image.cid}
									source={{ uri: image.uri }}
									style={{
										height: height,
										width: width,
									}}
								/>
							)
						})}
					</ScrollView>
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
						>
							<View></View>
						</TouchableOpacity>
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
			</SwipeNavRecognizer>
		</Modal>
	)
}
