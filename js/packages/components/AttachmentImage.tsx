import React, { useState, useEffect } from 'react'
import { Image, ImageProps, ActivityIndicator, View, TouchableOpacity } from 'react-native'
import { useSelector } from 'react-redux'

import { useMedia } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'
import { selectProtocolClient } from '@berty/redux/reducers/ui.reducer'
import { getSource } from '@berty/utils/protocol/attachments'

const AttachmentImage: React.FC<{ cid: string; pressable?: boolean } & Omit<ImageProps, 'source'>> =
	React.memo(props => {
		const { navigate } = useNavigation()
		const protocolClient = useSelector(selectProtocolClient)
		const [source, setSource] = useState('')
		const { cid, ...imageProps } = props
		const media = useMedia(cid)
		const mimeType = media?.mimeType || 'image/jpeg'

		useEffect(() => {
			if (!protocolClient) {
				return
			}
			let cancel = false
			getSource(protocolClient, cid)
				.then(src => {
					if (!cancel) {
						setSource(`data:${mimeType};base64,${src}`)
					}
				})
				.catch(e => console.error('failed to get attachment image:', e))
			return () => {
				cancel = true
			}
		}, [protocolClient, cid, mimeType])

		if (!source) {
			return (
				<View style={[props.style, { alignItems: 'center', justifyContent: 'center' }]}>
					<ActivityIndicator color='grey' />
				</View>
			)
		}

		return !props.pressable ? (
			<Image source={{ uri: source }} {...imageProps} />
		) : (
			<TouchableOpacity
				onPress={() => {
					navigate('Modals.ImageView', { images: [{ uri: source }], previewOnly: true })
				}}
			>
				<Image source={{ uri: source }} {...imageProps} />
			</TouchableOpacity>
		)
	})

export default AttachmentImage
