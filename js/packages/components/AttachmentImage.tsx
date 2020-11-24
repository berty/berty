import React, { useState, useEffect } from 'react'
import { Image, ImageProps, ActivityIndicator, View } from 'react-native'
import { Buffer } from 'buffer'

import { useMsgrContext } from '@berty-tech/store/hooks'
import { EOF } from '@berty-tech/grpc-bridge'
import { WelshProtocolServiceClient } from '@berty-tech/grpc-bridge/welsh-clients.gen'

let cache: { [key: string]: Promise<string> } = {}

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
	return 'data:image/jpeg;base64,' + data.toString('base64')
}

const getSource = async (
	protocolClient: WelshProtocolServiceClient,
	cid: string,
): Promise<string> => {
	if (!cache[cid]) {
		cache[cid] = fetchSource(protocolClient, cid)
	}
	return cache[cid]
}

const AttachmentImage: React.FC<{ cid: string } & Omit<ImageProps, 'source'>> = (props) => {
	const { protocolClient } = useMsgrContext()
	const [source, setSource] = useState('')
	const { cid, ...imageProps } = props

	useEffect(() => {
		if (!protocolClient) {
			return
		}
		let cancel = false
		getSource(protocolClient, cid)
			.then((src) => {
				if (!cancel) {
					setSource(src)
				}
			})
			.catch((e) => console.error('failed to get attachment image:', e))
		return () => {
			cancel = true
		}
	}, [protocolClient, cid])

	if (!source) {
		return (
			<View style={[props.style, { alignItems: 'center', justifyContent: 'center' }]}>
				<ActivityIndicator color='grey' />
			</View>
		)
	}

	return <Image source={{ uri: source }} {...imageProps} />
}

export default AttachmentImage
