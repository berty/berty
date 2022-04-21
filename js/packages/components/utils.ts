import { Buffer } from 'buffer'
import beapi from '@berty/api'
import emojiSource from 'emoji-datasource'
import 'string.fromcodepoint'

import { WelshProtocolServiceClient } from '@berty/grpc-bridge/welsh-clients.gen'
import { Emoji } from '@berty/contexts/styles/types'

let cache: { cid: string; prom: Promise<string> }[] = []

export const base64ToURLBase64 = (str: string) =>
	str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '')

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
			if (err?.EOF) {
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

export const getSource = async (
	protocolClient: WelshProtocolServiceClient,
	cid: string,
): Promise<string> => {
	if (!cache.find(item => item.cid === cid)) {
		if (cache.length >= 20) {
			// evict
			cache = cache.slice(1)
		}
		cache.push({ cid, prom: fetchSource(protocolClient, cid) })
	}
	const cached = cache.find(item => item.cid === cid)
	if (!cached) {
		throw new Error('unexpected cache miss')
	}
	return cached.prom
}

type MediaElementType = 'file' | 'picture' | 'audio'

export const getMediaTypeFromMedias = (
	medias: beapi.messenger.Interaction['medias'] | null | undefined,
) => {
	let type: MediaElementType = 'file'
	if (medias?.[0]?.mimeType?.startsWith('image')) {
		type = 'picture'
	} else if (medias?.[0]?.mimeType?.startsWith('audio')) {
		type = 'audio'
	}

	return type
}

export const emojis: Emoji[] = emojiSource

const toEmoji = (code: any) => {
	return String.fromCodePoint(...code.split('-').map((u: string) => '0x' + u))
}

export const getEmojiByName = (name: string) => {
	const requiredSource = emojis.find((item: Emoji) => item.short_name === name.replaceAll(':', ''))
	if (!requiredSource) {
		return
	}
	return toEmoji(requiredSource?.unified)
}
