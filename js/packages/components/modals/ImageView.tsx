import React, { useState } from 'react'
import { View, Modal, TouchableOpacity, Image } from 'react-native'
import { Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import CameraRoll from '@berty/polyfill/react-native-community-cameraroll'
import Share from '@berty/polyfill/react-native-share'
import ImageViewer from '@berty/polyfill/react-native-image-zoom-viewer'

import { useStyles } from '@berty/styles'
import { useThemeColor } from '@berty/store'
import { ScreenFC, useNavigation } from '@berty/navigation'

import { ForwardToBertyContactModal } from './ForwardToBertyContactModal'
import { BText } from '../shared-components/BText'

export const ImageView: ScreenFC<'Modals.ImageView'> = ({
	route: {
		params: { images, previewOnly = false },
	},
}) => {
	const [{ border, padding }] = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()
	const { goBack } = useNavigation()

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
				const uri = images[currentIndex]?.uri
				if (!uri) {
					return
				}
				CameraRoll.save(uri, { type: 'photo' })
					.then(() => {
						setModalVisibility(false)
						handleMessage(t('chat.files.image-saved'))
					})
					.catch(err => console.log(err))
			},
		},
		{
			title: t('chat.files.share'),
			onPress() {
				const img = images[currentIndex]
				if (!img) {
					return
				}
				Share.open({
					title: img.displayName || img.filename || 'Image from Berty',
					url: img.uri,
				})
					.then(() => {})
					.catch(err => {
						err && console.log(err)
					})
			},
		},
		{
			title: t('chat.files.forward-berty'),
			onPress() {
				setForwardModalVisibility(true)
				setModalVisibility(false)
			},
		},
	]

	return (
		<Modal transparent>
			<ImageViewer
				imageUrls={images.map(image => ({
					url: image.uri || Image.resolveAssetSource(image).uri,
				}))}
				index={0}
				onClick={() => {
					setModalVisibility(prev => !prev)
				}}
				onChange={index => {
					index && setCurrentIndex(index)
				}}
				renderFooter={() => <></>}
				renderIndicator={previewOnly ? () => <></> : undefined}
				enablePreload
				enableSwipeDown
				onSwipeDown={goBack}
			/>

			{isModalVisible && (
				<Modal transparent animationType='fade'>
					<TouchableOpacity
						style={[padding.medium, { position: 'absolute', top: 50, left: 10, zIndex: 9 }]}
						activeOpacity={0.8}
						onPress={goBack}
					>
						<Icon
							name='arrow-back-outline'
							fill={colors['reverted-main-text']}
							style={{ opacity: 0.8 }}
							height={30}
							width={30}
						/>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => setModalVisibility(false)} style={{ flex: 1 }} />
					{!previewOnly && (
						<View
							style={[
								{
									position: 'absolute',
									left: 0,
									bottom: 0,
									right: 0,
									backgroundColor: colors['main-background'],
								},
								padding.medium,
								border.radius.top.large,
							]}
						>
							{MENU_LIST.map(item => (
								<TouchableOpacity key={item.title} onPress={item.onPress} style={[padding.medium]}>
									<BText style={{ textAlign: 'center' }}>{item.title}</BText>
								</TouchableOpacity>
							))}
						</View>
					)}
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
							{ backgroundColor: colors['main-background'] },
						]}
					>
						<BText style={{ color: 'black' }}>{message}</BText>
					</View>
				</View>
			)}
			{isForwardModalVisible && (
				<ForwardToBertyContactModal
					image={images[currentIndex]}
					onClose={() => setForwardModalVisibility(false)}
				/>
			)}
		</Modal>
	)
}
