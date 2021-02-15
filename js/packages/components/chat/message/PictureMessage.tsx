import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { useMsgrContext } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'
import { getSource } from '../../utils'
import { ImageCounter } from '../ImageCounter'

import { useNavigation } from '@berty-tech/navigation'

export const PictureMessage: React.FC<{ medias: any }> = ({ medias }) => {
	const [{ border }] = useStyles()
	const { client } = useMsgrContext()
	const [images, setImages] = useState<any[]>([])
	const navigation = useNavigation()
	useEffect(() => {
		if (!client) {
			return
		}

		Promise.all(
			medias.map((media: any) => {
				return getSource(client, media.cid)
					.then((uri) => {
						return { ...media, uri }
					})
					.catch((e) => console.error('failed to get picture message image:', e))
			}),
		).then((images: any) => setImages(images.filter(Boolean)))
	}, [client, medias])

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
									height: 165,
									width: 165,
								},
								border.radius.small,
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
	)
}
