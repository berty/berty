import React, { useEffect, useState } from 'react'
import {
	TouchableOpacity,
	View,
	ScrollView,
	Image,
	Platform,
	ActivityIndicator,
} from 'react-native'
import { Icon } from '@ui-kitten/components'
import CameraRoll from '@react-native-community/cameraroll'
import RNFS from 'react-native-fs'

import { useStyles } from '@berty-tech/styles'
import { useThemeColor } from '@berty-tech/store/hooks'
import beapi from '@berty-tech/api'

import { ImageCounter } from '../ImageCounter'

const GALLERY_IMAGE_PER_PAGE = 30

export const GallerySection: React.FC<{
	prepareMediaAndSend: (media: beapi.messenger.IMedia[]) => void
	isLoading: boolean
}> = ({ prepareMediaAndSend, isLoading }) => {
	const [{ border, padding, margin }] = useStyles()
	const colors = useThemeColor()

	const [selectedImages, setSelectedImages] = useState<beapi.messenger.IMedia[]>([])
	const [galleryImageEndCursor, setGalleryImageEndCursor] = useState<string | null | undefined>(
		null,
	)

	const [galleryContents, setGalleryContents] = useState<beapi.messenger.IMedia[]>([])

	async function getInitalGalleryContents() {
		try {
			const photos = await CameraRoll.getPhotos({
				first: GALLERY_IMAGE_PER_PAGE,
			})

			setGalleryContents(
				photos.edges.map(({ node: { image: { filename, uri }, type: mime } }) => ({
					filename: filename || '',
					uri,
					mimeType: mime,
				})),
			)

			setGalleryImageEndCursor(photos.page_info.has_next_page ? photos.page_info.end_cursor : null)
		} catch (err) {
			console.log('getPhotos err', err)
		}
	}

	useEffect(() => {
		getInitalGalleryContents()
	}, [])

	const getUploadableURI = async (item: beapi.messenger.IMedia) => {
		if (Platform.OS === 'android') {
			return item.uri
		}
		// Workaround to get uploadable uri from ios
		const destination = `${RNFS.TemporaryDirectoryPath}${item.filename}`
		try {
			let absolutePath = item.uri && (await RNFS.copyAssetsFileIOS(item.uri, destination, 0, 0))
			setTimeout(() => RNFS.unlink(destination), 10000)
			return absolutePath
		} catch (error) {
			console.log(error)
		}
	}

	const handleSend = async () => {
		try {
			let selectedImageWithUplodableURI = await Promise.all(
				selectedImages.map(async (item) => ({
					...item,
					uri: (await getUploadableURI(item)) || '',
				})),
			)

			selectedImageWithUplodableURI.length && prepareMediaAndSend(selectedImageWithUplodableURI)
		} catch (e) {
			console.log('image path error', e)
		}
	}

	return (
		<>
			{galleryContents.length > 0 && (
				<ScrollView
					onScroll={async ({ nativeEvent: { layoutMeasurement, contentOffset, contentSize } }) => {
						if (
							galleryImageEndCursor &&
							layoutMeasurement.height + contentOffset.y >= contentSize.height - 20
						) {
							try {
								const photos = await CameraRoll.getPhotos({
									first: GALLERY_IMAGE_PER_PAGE,
									after: galleryImageEndCursor,
								})

								setGalleryContents((prev) => [
									...prev,
									...photos.edges.map(({ node: { image: { filename, uri }, type: mime } }) => ({
										filename: filename || '',
										uri,
										mime,
									})),
								])

								setGalleryImageEndCursor(
									photos.page_info.has_next_page ? photos.page_info.end_cursor : null,
								)
							} catch (err) {
								console.log('getPhotos err', err)
							}
						}
					}}
					scrollEventThrottle={400}
					style={[{ height: 300 }, padding.medium]}
					contentContainerStyle={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: colors['main-background'],
					}}
				>
					{galleryContents.map((content) => (
						<TouchableOpacity
							activeOpacity={0.8}
							key={content.filename}
							style={[
								{ backgroundColor: colors['main-background'], position: 'relative' },
								padding.tiny,
								border.radius.tiny,
								margin.bottom.tiny,
							]}
							onPress={() => {
								setSelectedImages((prevImages) => {
									if (prevImages.find((prevImage) => prevImage.filename === content.filename)) {
										return prevImages.filter((image) => image.filename !== content.filename)
									} else {
										return [...prevImages, content]
									}
								})
							}}
						>
							<Image
								source={{ uri: content.uri || '' }}
								style={[{ height: 110, width: 100 }, border.radius.tiny]}
							/>
							{selectedImages.find((image) => image.filename === content.filename) && (
								<View style={{ position: 'absolute', top: 5, right: 5 }}>
									<Icon
										height={40}
										width={40}
										name='checkmark-circle-2'
										fill={colors['reverted-main-text']}
										style={{}}
									/>
								</View>
							)}
						</TouchableOpacity>
					))}
				</ScrollView>
			)}
			{selectedImages.length > 0 && (
				<View
					style={[
						{
							flexDirection: 'row',
							backgroundColor: colors['main-background'],
							alignItems: 'center',
							justifyContent: 'space-between',
						},
						padding.small,
						border.radius.small,
						margin.large,
					]}
				>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						{selectedImages.slice(0, 2).map((image) => (
							<Image
								key={image.filename}
								source={{
									uri: image.uri || '',
								}}
								style={[{ height: 50, width: 55 }, border.radius.tiny, margin.right.medium]}
							/>
						))}
						{selectedImages.length > 2 && <ImageCounter count={selectedImages.length - 2} />}
					</View>

					<TouchableOpacity onPress={handleSend}>
						{isLoading ? (
							<ActivityIndicator />
						) : (
							<Icon name='paper-plane-outline' width={26} height={26} fill={colors['main-text']} />
						)}
					</TouchableOpacity>
				</View>
			)}
		</>
	)
}
