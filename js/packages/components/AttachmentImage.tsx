import React, { useState, useEffect } from 'react'
import { Image, ImageProps, ActivityIndicator, View, TouchableOpacity } from 'react-native'

import { useMsgrContext } from '@berty-tech/store/hooks'
import { navigate } from '@berty-tech/navigation'

import { getSource } from './utils'

const AttachmentImage: React.FC<
	{ cid: string; notPressable?: boolean } & Omit<ImageProps, 'source'>
> = (props) => {
	const { client, medias } = useMsgrContext()
	const [source, setSource] = useState('')
	const { cid, ...imageProps } = props
	const mimeType = medias[cid]?.mimeType || 'image/jpeg'

	console.log('source', source, 'mime', medias[cid]?.mimeType)

	useEffect(() => {
		if (!client) {
			return
		}
		let cancel = false
		getSource(client, cid)
			.then(async (src) => {
				if (!cancel) {
					console.log('got src for', cid, src)
					setSource(src)
				}
			})
			.catch((e) => console.error('failed to get attachment image:', e))
		return () => {
			cancel = true
		}
	}, [client, cid, mimeType])

	if (!source) {
		return (
			<View style={[props.style, { alignItems: 'center', justifyContent: 'center' }]}>
				<ActivityIndicator color='grey' />
			</View>
		)
	}

	const img = (
		<Image
			source={{ uri: source }}
			onError={(e) => {
				console.error('image load failed:', e.nativeEvent.error)
			}}
			{...imageProps}
		/>
	)

	return props.notPressable ? (
		img
	) : (
		<TouchableOpacity onPress={() => navigate('Image', { cid })}>{img}</TouchableOpacity>
	)
}

export default AttachmentImage
