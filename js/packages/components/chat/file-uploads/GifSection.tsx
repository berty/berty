import React, { useEffect, useState } from 'react'
import { TouchableOpacity, View, ScrollView, Image, TextInput } from 'react-native'
import { useStyles } from '@berty-tech/styles'
import { Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import beapi from '@berty-tech/api'
import RNFS from 'react-native-fs'

const GIF_IMAGE_PER_PAGE = 10

export const GifSection: React.FC<{
	prepareMediaAndSend: (media: beapi.messenger.IMedia[]) => void
}> = ({ prepareMediaAndSend }) => {
	const [{ color, border, padding, margin }] = useStyles()
	const { t }: { t: any } = useTranslation()

	const [searchQuery, setSearchQuery] = useState('')
	const [GIFTotalCount, setGIFTotalCount] = useState<number>(0)

	const [GIFs, setGIFs] = useState<
		{
			url: string
			stillURL: string
		}[]
	>([])

	function handleSearchQueryChange(query = '') {
		setSearchQuery(query)
		fetchGIFs(query)
	}

	async function fetchGIFs(query = '', offset = 0) {
		const GIPHY_API_KEY = '0Tjt245wq9x0QO9L2DRy2hV6Q5sw7ZDf'
		const URL = query
			? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=${GIF_IMAGE_PER_PAGE}&offset=${offset}`
			: `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${GIF_IMAGE_PER_PAGE}&offset=${offset}`
		fetch(URL)
			.then((response) => response.json())
			.then((response) => {
				response?.data?.length &&
					setGIFs((prevGIFs) => [
						...(offset ? prevGIFs : []),
						...response.data.map(
							({
								images: {
									fixed_width_downsampled: { url },
									fixed_width_small_still: { url: stillURL },
								},
							}: {
								images: {
									fixed_width_downsampled: { url: string }
									fixed_width_small_still: { url: string }
								}
							}) => ({ url, stillURL }),
						),
					])
				setGIFTotalCount(response?.pagination?.total_count || 0)
			})
			.catch((error) => {
				console.error(error)
			})
	}

	useEffect(() => {
		fetchGIFs()
	}, [])

	return (
		<>
			<View
				style={[
					margin.small,
					padding.horizontal.large,
					padding.vertical.small,
					border.radius.small,
					{
						flexDirection: 'row',
						alignItems: 'center',
						backgroundColor: '#F1F4F6',
					},
				]}
			>
				<Icon name='search' fill='#8F9BB3' height={30} width={30} />
				<TextInput
					value={searchQuery}
					autoFocus
					placeholder={t('chat.files.search-gif')}
					style={[
						margin.horizontal.small,
						{
							flex: 1,
						},
					]}
					onChangeText={(query) => handleSearchQueryChange(query)}
				/>
				{searchQuery.length > 0 && (
					<TouchableOpacity onPress={() => handleSearchQueryChange('')} style={[padding.tiny]}>
						<Icon name='close-circle-outline' fill='#8F9BB3' height={30} width={30} />
					</TouchableOpacity>
				)}
			</View>
			{GIFs.length > 0 && (
				<ScrollView
					keyboardShouldPersistTaps={'handled'}
					onScroll={async ({ nativeEvent: { layoutMeasurement, contentOffset, contentSize } }) => {
						if (
							GIFTotalCount > GIFs.length &&
							layoutMeasurement.height + contentOffset.y >= contentSize.height - 20
						) {
							fetchGIFs(searchQuery, GIFs.length)
						}
					}}
					scrollEventThrottle={400}
					style={[
						{
							height: 300,
						},
						padding.medium,
					]}
					contentContainerStyle={{
						flexDirection: 'row',
						flexWrap: 'wrap',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: '#FEFEFF',
					}}
				>
					{GIFs.map(({ url, stillURL }) => (
						<TouchableOpacity
							activeOpacity={0.8}
							key={url}
							style={[
								{
									backgroundColor: color.white,
									position: 'relative',
								},
								border.radius.tiny,
								margin.tiny,
							]}
							onPress={async () => {
								const destination = `${RNFS.TemporaryDirectoryPath}${Math.random()
									.toString(36)
									.substring(7)}.gif`

								RNFS.downloadFile({
									fromUrl: url,
									toFile: destination,
								})
									.promise.then(() => {
										prepareMediaAndSend([
											{
												uri: destination,
												mimeType: 'image/gif',
												filename: `${Math.random().toString(36).substring(7)}.gif`,
											},
										])

										setTimeout(() => {
											RNFS.unlink(destination)
										}, 5000)
									})
									.catch((err) => console.log(err))
							}}
						>
							<Image
								source={{ uri: url }}
								style={[
									{
										height: 110,
										width: 100,
										zIndex: 9,
									},
									border.radius.tiny,
								]}
							/>
							<Image
								source={{ uri: stillURL }}
								style={[
									{
										height: 110,
										width: 100,
										position: 'absolute',
										top: 0,
										left: 0,
									},
									border.radius.tiny,
								]}
							/>
						</TouchableOpacity>
					))}
				</ScrollView>
			)}
		</>
	)
}
