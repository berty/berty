import React, { useState, useEffect } from 'react'
import { Image, ImageProps, ActivityIndicator, View, TouchableOpacity } from 'react-native'
import { Buffer } from 'buffer'

import { useMsgrContext } from '@berty-tech/store/hooks'
import { EOF } from '@berty-tech/grpc-bridge'
import { WelshProtocolServiceClient } from '@berty-tech/grpc-bridge/welsh-clients.gen'
import { navigate } from '@berty-tech/navigation'

let cache: { cid: string; prom: Promise<string> }[] = []

const fetchSource = async (
	protocolClient: WelshProtocolServiceClient,
	cid: string,
): Promise<string> => {
	const stream = await protocolClient.attachmentRetrieve({
		attachmentCid: Buffer.from(cid, 'base64'),
	})
	const data = await new Promise<Buffer>((resolve, reject) => {
		let buf = Buffer.from('')
		stream.onMessage((msg, err) => {
			if (err === EOF) {
				resolve(buf)
				return
			}
			if (err) {
				reject(err)
				return
			}
			if (msg?.block) {
				buf = Buffer.concat([buf, msg.block])
			}
		})
		stream.start()
	})
	return data.toString('base64')
}

const getSource = async (
	protocolClient: WelshProtocolServiceClient,
	cid: string,
): Promise<string> => {
	if (!cache.find((item) => item.cid === cid)) {
		if (cache.length >= 20) {
			// evict
			cache = cache.slice(1)
		}
		cache.push({ cid, prom: fetchSource(protocolClient, cid) })
	}
	const cached = cache.find((item) => item.cid === cid)
	if (!cached) {
		throw new Error('unexpected cache miss')
	}
	return cached.prom
}

const AttachmentImage: React.FC<
	{ cid: string; notPressable?: boolean } & Omit<ImageProps, 'source'>
> = (props) => {
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

	return props.notPressable ? (
		<Image source={{ uri: source }} {...imageProps} />
	) : (
		<TouchableOpacity onPress={() => navigate('Image', { cid })}>
			<Image source={{ uri: source }} {...imageProps} />
		</TouchableOpacity>
	)
}

export default AttachmentImage
