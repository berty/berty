import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { useMsgrContext } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'
import { getSource } from '../../utils'
import { ImageCounter } from '../ImageCounter'

import { useNavigation } from '@berty-tech/navigation'

export const PictureMessage: React.FC<{ medias: any }> = ({ medias }) => {
	const [{ padding, border }] = useStyles()
	const { protocolClient } = useMsgrContext()
	const [images, setImages] = useState<any[]>([])
	const navigation = useNavigation()
	useEffect(() => {
		if (!protocolClient) {
			return
		}

		Promise.all(
			medias.map((media: any) => {
				return getSource(protocolClient, media.cid)
					.then((src) => {
						return { ...media, uri: `data:${media.mimeType};base64,${src}` }
					})
					.catch((e) => console.error('failed to get picture message image:', e))
			}),
		).then((images: any) => setImages(images.filter(Boolean)))
	}, [protocolClient, medias])

	return (
		<View
			style={[
				{
					alignItems: 'center',
					justifyContent: 'center',
					marginBottom: images.length * 5,
				},
			]}
		>
			<View
				style={[
					{
						flexDirection: 'row',
						alignContent: 'center',
						justifyContent: 'center',
					},
					padding.horizontal.small,
				]}
			>
				<View
					style={{
						height: 150 + (medias.length > 4 ? 4 : medias.length) * 15,
						width: 150 + (medias.length > 4 ? 7 : medias.length) * 18,
						position: 'relative',
					}}
				>
					{medias
						.slice(0, medias.length > 4 ? 4 : medias.length)
						.map((media: any, index: number) => (
							<TouchableOpacity
								onPress={() => {
									navigation.navigate.modals.imageView({ images })
								}}
								activeOpacity={1}
								style={{
									position: 'absolute',
									zIndex: 5 - index,
									elevation: 5 - index,
									left: index * 18,
									bottom: index * 15,
								}}
							>
								<View
									key={media.cid}
									style={[
										{
											backgroundColor: '#E9EAF8',
											alignItems: 'center',
											justifyContent: 'center',
										},
										border.radius.small,
										padding.small,
										border.shadow.small,
									]}
								>
									<Image
										source={{ uri: images[index]?.uri }}
										style={[
											{
												height: 150,
												width: 150,
											},
											border.radius.tiny,
										]}
									/>

									{!images[index] && (
										<ActivityIndicator
											color='white'
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
		</View>
	)
}
