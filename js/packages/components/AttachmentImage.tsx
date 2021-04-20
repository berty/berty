import React, { useState, useEffect } from 'react'
import { Image, ImageProps, ActivityIndicator, View, TouchableOpacity } from 'react-native'

import { useMsgrContext } from '@berty-tech/store/hooks'
import { useNavigation } from '@berty-tech/navigation'
import { getSource } from './utils'

const AttachmentImage: React.FC<
	{ cid: string; pressable?: boolean } & Omit<ImageProps, 'source'>
> = (props) => {
	const { navigate } = useNavigation()
	const { protocolClient, medias } = useMsgrContext()
	const [source, setSource] = useState('')
	const { cid, ...imageProps } = props
	const mimeType = medias[cid]?.mimeType || 'image/jpeg'

	useEffect(() => {
		if (!protocolClient) {
			return
		}
		let cancel = false
		getSource(protocolClient, cid)
			.then((src) => {
				if (!cancel) {
					setSource(`data:${mimeType};base64,${src}`)
				}
			})
			.catch((e) => console.error('failed to get attachment image:', e))
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
				navigate.modals.imageView({ images: [{ uri: source }], previewOnly: true })
			}}
		>
			<Image source={{ uri: source }} {...imageProps} />
		</TouchableOpacity>
	)
}

export default AttachmentImage
