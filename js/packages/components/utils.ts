import { Platform } from 'react-native'
import { Buffer } from 'buffer'
import beapi from '@berty-tech/api'
import emojiSource from 'emoji-datasource'
import 'string.fromcodepoint'

import { WelshProtocolServiceClient } from '@berty-tech/grpc-bridge/welsh-clients.gen'
import { checkNotifications, check, PERMISSIONS, RESULTS } from 'react-native-permissions'
import { useEffect, useRef } from 'react'

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

export const getMediaTypeFromMedias = (
	medias: beapi.messenger.Interaction['medias'] | null | undefined,
): string => {
	let type = 'file'
	if (medias?.[0]?.mimeType?.startsWith('image')) {
		type = 'picture'
	} else if (medias?.[0]?.mimeType?.startsWith('audio')) {
		type = 'audio'
	}

	return type
}

export const toEmoji = (code: any) => {
	return String.fromCodePoint(...code.split('-').map((u: string) => '0x' + u))
}

export const getEmojiByName = (name: string) => {
	const requiredSource = emojiSource.find(
		(item: any) => item.short_name === name.replaceAll(':', ''),
	)
	return toEmoji(requiredSource?.unified)
}

export const useTimeout = (callback: () => void, delay: number | null) => {
	const savedCallback = useRef(callback)

	// Remember the latest callback if it changes.
	useEffect(() => {
		savedCallback.current = callback
	}, [callback])

	// Set up the timeout.
	useEffect(() => {
		// Don't schedule if no delay is specified.
		if (delay === null) {
			return
		}
		const id = setTimeout(() => savedCallback.current(), delay)
		return () => clearTimeout(id)
	}, [delay])
}

export const checkPermissions = async (
	permissionType: 'p2p' | 'audio' | 'notification' | 'camera',
	navigate: any,
	options?: { createNewAccount?: boolean; isToNavigate?: boolean; navigateNext?: string },
) => {
	let status
	if (permissionType === 'notification') {
		try {
			const res = await checkNotifications()
			status = res.status
			//
		} catch (err) {
			console.log('request notification permission err:', err)
		}
	} else if (permissionType === 'p2p') {
		status = await check(
			Platform.OS === 'ios'
				? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
				: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
		)
	} else if (permissionType === 'camera') {
		status = await check(
			Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA,
		)
	} else if (permissionType === 'audio') {
		status = await check(
			Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
		)
	}

	console.log('RESULTS', status)
	if ((status === RESULTS.DENIED || status === RESULTS.BLOCKED) && options?.isToNavigate) {
		navigate('Main.Permissions', {
			permissionType,
			permissionStatus: status,
			navigateNext: options?.navigateNext,
			createNewAccount: options?.createNewAccount,
		})
	} else if (options?.navigateNext) {
		navigate(options?.navigateNext, {})
	}

	return status
}
