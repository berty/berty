import React, { useEffect, useState } from 'react'
import {
	TouchableOpacity,
	View,
	ScrollView,
	Image,
	Platform,
	ActivityIndicator,
	Text,
} from 'react-native'
import { Icon } from '@ui-kitten/components'
import CameraRoll from '@react-native-community/cameraroll'
import RNFS from 'react-native-fs'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { useThemeColor } from '@berty-tech/store/hooks'
import beapi from '@berty-tech/api'

import { ImageCounter } from '../../ImageCounter'

const GALLERY_IMAGE_PER_PAGE = 30

export const GallerySection: React.FC<{
	prepareMediaAndSend: (media: beapi.messenger.IMedia[]) => void
	isLoading: boolean
}> = ({ prepareMediaAndSend, isLoading }) => {
	const [{ border, padding, margin }] = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()

	const [selectedImages, setSelectedImages] = useState<
		(beapi.messenger.IMedia & { uri: string })[]
	>([])
	const [galleryImageEndCursor, setGalleryImageEndCursor] = useState<string | null | undefined>(
		null,
	)

	const [loadingGallery, setLoadingGallery] = useState(true)

	const [galleryContents, setGalleryContents] = useState<
		(beapi.messenger.IMedia & { uri: string })[]
	>([])

	async function getInitalGalleryContents() {
		try {
			const photos = await CameraRoll.getPhotos({
				first: GALLERY_IMAGE_PER_PAGE,
			})

			setLoadingGallery(false)

			setGalleryContents(
				photos.edges.map(
					({
						node: {
							image: { filename, uri },
							type: mime,
						},
					}) => ({
						filename: filename || '',
						uri,
						mimeType: mime,
					}),
				),
			)

			setGalleryImageEndCursor(photos.page_info.has_next_page ? photos.page_info.end_cursor : null)
		} catch (err) {
			console.log('getPhotos err', err)
		}
	}

	useEffect(() => {
		getInitalGalleryContents()
	}, [])

	const getUploadableURI = async (item: beapi.messenger.IMedia & { uri: string }) => {
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
				selectedImages.map(async item => ({
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

							setGalleryContents(prev => [
								...prev,
								...photos.edges.map(
									({
										node: {
											image: { filename, uri },
											type: mime,
										},
									}) => ({
										filename: filename || '',
										uri,
										mime,
									}),
								),
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
				style={[{ maxHeight: 150 }, padding.medium, { paddingTop: 0 }]}
				contentContainerStyle={{
					flexDirection: 'row',
					flexWrap: 'wrap',
					alignItems: 'center',
					justifyContent: 'center',
					backgroundColor: colors['main-background'],
				}}
			>
				{loadingGallery ? (
					<ActivityIndicator />
				) : (
					galleryContents.length <= 0 && <Text>{t('chat.files.no-images')}</Text>
				)}
				{galleryContents.map(content => (
					<TouchableOpacity
						activeOpacity={0.8}
						key={content.cid || content.uri}
						style={[
							{ backgroundColor: colors['main-background'], position: 'relative' },
							padding.tiny,
							border.radius.tiny,
							margin.bottom.tiny,
						]}
						onPress={() => {
							if (isLoading) {
								return
							}
							setSelectedImages(prevImages => {
								if (prevImages.find(prevImage => prevImage.uri === content.uri)) {
									return prevImages.filter(image => image.uri !== content.uri)
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
						{selectedImages.find(image => image.uri === content.uri) && (
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

			{selectedImages.length > 0 && (
				<View
					style={[
						{
							flexDirection: 'row',
							backgroundColor: colors['main-background'],
							alignItems: 'center',
							justifyContent: 'space-between',
							width: '100%',
						},
						padding.small,
						padding.horizontal.large,
						border.radius.small,
						margin.medium,
					]}
				>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						{selectedImages.slice(0, 2).map(image => (
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
