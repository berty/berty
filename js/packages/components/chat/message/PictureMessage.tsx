import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'
import { selectProtocolClient } from '@berty/redux/reducers/ui.reducer'
import { getSource } from '@berty/utils/protocol/attachments'

import { ImageCounter } from '../ImageCounter'

export const PictureMessage: React.FC<{
	medias: beapi.messenger.IMedia[]
	onLongPress: () => void
	isHighlight: boolean
}> = ({ medias, onLongPress, isHighlight }) => {
	const { border } = useStyles()
	const colors = useThemeColor()
	const protocolClient = useSelector(selectProtocolClient)
	const [images, setImages] = useState<any[]>([])
	const navigation = useNavigation()

	useEffect(() => {
		if (!protocolClient) {
			return
		}

		Promise.all(
			medias.map(async media => {
				try {
					const src = await getSource(protocolClient, media.cid)

					return { ...media, uri: `data:${media.mimeType};base64,${src}` }
				} catch (e) {
					console.error('failed to get picture message image:', e)
				}
			}),
			// https://michaeluloth.com/filter-boolean -> filter(Boolean): a way to quickly remove all empty items from an array
		).then(images => setImages(images.filter(Boolean)))
	}, [protocolClient, medias])

	return (
		<View style={styles.container}>
			<View
				style={{
					height: 165 + (medias.length > 4 ? 3 : medias.length - 1) * 15,
					width: 165 + (medias.length > 4 ? 3 : medias.length - 1) * 18,
					position: 'relative',
					marginRight: medias.length > 4 ? 60 : 0,
				}}
			>
				{medias.slice(0, medias.length > 4 ? 4 : medias.length).map((media, index) => (
					<TouchableOpacity
						onPress={() => {
							navigation.navigate('Modals.ImageView', { images })
						}}
						onLongPress={onLongPress}
						activeOpacity={1}
						style={{
							position: 'absolute',
							zIndex: 5 - index,
							elevation: 5 - index,
							left: index * 18,
							bottom: index * 15,
						}}
						key={media.cid}
					>
						<View
							key={media.cid}
							style={[
								{
									backgroundColor: colors['input-background'],
									shadowColor: colors.shadow,
								},
								styles.imageWrapper,
								border.radius.small,
								border.shadow.small,
								isHighlight && {
									borderColor: colors['background-header'],
									shadowColor: colors.shadow,
								},
							]}
						>
							<Image
								source={{ uri: images[index]?.uri }}
								style={[{ height: 150, width: 150 }, border.radius.tiny]}
							/>

							{!images[index] && (
								<ActivityIndicator
									color={colors['main-background']}
									size='large'
									style={{
										position: 'absolute',
										left: 0,
										right: 0,
										zIndex: 4 - index,
										elevation: 4 - index,
									}}
								/>
							)}
						</View>
					</TouchableOpacity>
				))}
			</View>

			{medias.length > 4 && (
				<View style={styles.counter}>
					<ImageCounter count={medias.length - 4} />
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		alignContent: 'center',
		justifyContent: 'center',
	},
	imageWrapper: {
		alignItems: 'center',
		justifyContent: 'center',
		height: 165,
		width: 165,
		borderWidth: 1,
		shadowOffset: {
			width: 0,
			height: 8,
		},
		shadowOpacity: 0.44,
		shadowRadius: 10.32,
		elevation: 16,
	},
	counter: {
		right: 0,
		top: 70,
		position: 'absolute',
	},
})
