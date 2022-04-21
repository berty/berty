import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'

import { useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { useNavigation } from '@berty/navigation'

import { getSource } from '../../utils'
import { ImageCounter } from '../ImageCounter'
import { useSelector } from 'react-redux'
import { selectProtocolClient } from '@berty/redux/reducers/ui.reducer'

export const PictureMessage: React.FC<{
	medias: any
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
			medias.map((media: any) => {
				return getSource(protocolClient, media.cid)
					.then(src => {
						return { ...media, uri: `data:${media.mimeType};base64,${src}` }
					})
					.catch(e => console.error('failed to get picture message image:', e))
			}),
		).then((images: any) => setImages(images.filter(Boolean)))
	}, [protocolClient, medias])

	return (
		<View
			style={[
				{
					flexDirection: 'row',
					alignContent: 'center',
					justifyContent: 'center',
				},
			]}
		>
			<View
				style={{
					height: 165 + (medias.length > 4 ? 3 : medias.length - 1) * 15,
					width: 165 + (medias.length > 4 ? 3 : medias.length - 1) * 18,
					position: 'relative',
					marginRight: medias.length > 4 ? 60 : 0,
				}}
			>
				{medias.slice(0, medias.length > 4 ? 4 : medias.length).map((media: any, index: number) => (
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
									alignItems: 'center',
									justifyContent: 'center',
									height: 165,
									width: 165,
								},
								border.radius.small,
								border.shadow.small,
								isHighlight && {
									borderColor: colors['background-header'],
									borderWidth: 1,
									shadowColor: colors.shadow,
									shadowOffset: {
										width: 0,
										height: 8,
									},
									shadowOpacity: 0.44,
									shadowRadius: 10.32,
									elevation: 16,
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
				<View
					style={{
						right: 0,
						top: 70,
						position: 'absolute',
					}}
				>
					<ImageCounter count={medias.length - 4} />
				</View>
			)}
		</View>
	)
}
